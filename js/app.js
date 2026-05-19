// Expanded Framework Matrix (Dynamic Marketplace)
const frameworkControls = [
    { id: "def-1", name: "Enforce Multi-Factor Authentication (MFA)", description: "Protects enterprise identities and administrative entrypoints using out-of-band session tokens.", cost: 4000, mitigates: "T1110", ncsc: "NCSC: Identity Management", iso: "ISO 27001 A.8.5", boost: 8 },
    { id: "def-2", name: "Deploy Centralised Log Aggregation (SIEM)", description: "Ingests host telemetry, network traffic flows, and access events into an automated parsing engine.", cost: 6500, mitigates: "T1059", ncsc: "NCSC: Logging Made Easy", iso: "ISO 27001 A.8.16", boost: 10 },
    { id: "def-3", name: "Implement Internal Network Segmentation", description: "Enforces isolation barriers between production segments via internal firewalls to stop lateral pivots.", cost: 5000, mitigates: "T1021", ncsc: "NCSC: Enterprise Segregation", iso: "ISO 27001 A.8.22", boost: 8 },
    { id: "def-4", name: "Secure Email Gateways & Phishing Filters", description: "Applies heuristic content analysis, SPF/DKIM verification, and link rewriting to corporate messaging inbound queues.", cost: 3000, mitigates: "T1566", ncsc: "NCSC: Phishing Defenses", iso: "ISO 27001 A.8.10", boost: 6 },
    { id: "def-5", name: "Automated Patch Management & Vulnerability Scanning", description: "Schedules automated scanning cycles and distribution of operating system and third-party hotfixes.", cost: 4500, mitigates: "T1190", ncsc: "NCSC: Vulnerability Management", iso: "ISO 27001 A.8.19", boost: 8 },
    { id: "def-6", name: "Endpoint Detection and Response (EDR) Agents", description: "Monitors process trees and file integrity on physical devices using behavioral heuristics to catch zero-days.", cost: 7000, mitigates: "T1068", ncsc: "NCSC: Device Security", iso: "ISO 27001 A.8.17", boost: 12 },
    { id: "def-7", name: "Principle of Least Privilege (RBAC Execution)", description: "Strictly audits administrative groups, strips local administrative rights, and implements Role-Based Access Control.", cost: 2500, mitigates: "T1078", ncsc: "NCSC: Identity Management", iso: "ISO 27001 A.5.15", boost: 6 },
    { id: "def-8", name: "Application Whitelisting & AppLocker Policies", description: "Enforces strict structural rules blocking unapproved binary software applications from loading on corporate hosts.", cost: 3500, mitigates: "T1204", ncsc: "NCSC: Device Security", iso: "ISO 27001 A.8.18", boost: 7 }
];

// Base Archetypes used by the Procedural Generator
const attackArchetypes = [
    { mitre: "T1566", name: "Phishing Attempt", variants: ["Spearphishing Link", "Weaponized Attachment", "Social Engineered OAuth Consent Request"], counterId: "def-4", systemTargets: ["HR Inbox", "Finance Mail Server", "Executive Assistant Endpoint"] },
    { mitre: "T1110", name: "Brute Force Vector", variants: ["SSH Dictionary Flooding", "RDP Spray Attack", "API Password Stuffing"], counterId: "def-1", systemTargets: ["Perimeter DMZ Router", "Public-Facing Cloud Gateway", "External VPN Node"] },
    { mitre: "T1059", name: "Command & Script Interpreter Abuse", variants: ["Obfuscated PowerShell Execution", "Malicious Bash Scripting Sequence", "Encrypted Macro Execution Loop"], counterId: "def-2", systemTargets: ["Domain Workstation", "Linux Application Server", "Backup Controller Node"] },
    { mitre: "T1021", name: "Remote Services Lateral Hops", variants: ["RDP Session Hijacking", "SMB Mount Mapping", "Internal WinRM Traversal"], counterId: "def-3", systemTargets: ["Internal Active Directory", "Payroll DB Server", "Staging Asset Cluster"] },
    { mitre: "T1190", name: "Exploit Public-Facing Application", variants: ["SQL Injection Flaw Exploitation", "Log4j RCE Trigger String", "Buffer Overflow Packet Flooding"], counterId: "def-5", systemTargets: ["Public Corporate Website", "E-Commerce Database Gateway", "Legacy Inventory Portal"] },
    { mitre: "T1068", name: "Exploitation for Privilege Escalation", variants: ["Kernel Memory Space Leak", "UAC Bypass Execution", "Token Manipulation Script"], counterId: "def-6", systemTargets: ["Local Workstation Console", "File Server Core", "Print Queue Service Engine"] },
    { mitre: "T1078", name: "Valid Accounts Abuse", variants: ["Stolen API Credential Replay", "Leaked Admin Session Reuse", "Contractor Account Misuse"], counterId: "def-7", systemTargets: ["AWS Cloud Console", "Internal Source Code Repository", "SaaS CRM Panel"] },
    { mitre: "T1204", name: "User Execution Trigger", variants: ["Untrusted Freeware Installation", "Malicious Browser Extension Download", "Spoofed PDF Payload Load"], counterId: "def-8", systemTargets: ["Reception Desktop Host", "Marketing Laptop Node", "Research Terminal Asset"] }
];

const randomIOCs = {
    ips: ["185.220.101.4", "45.227.254.12", "91.241.19.82", "103.208.220.43"],
    files: ["invoice_archive.zip", "overdue_payment.xlsm", "system_update_patch.exe", "employee_salary_list.pdf.exe"],
    processes: ["powershell.exe -nop -w hidden -c", "cmd.exe /c certutil.exe -urlcache", "bash -i >& /dev/tcp/", "mimikatz.exe privilege::debug"]
};

let state = {
    turn: 1,
    maxTurns: 20,
    budget: 12000,
    securityScore: 60,
    activeAttack: null,
    isAttackActive: false,
    controlDeployedThisTurn: false,
    boardRequestUsedThisTurn: false,
    timeLeft: 30, // NEW: 30-second tracker limit per phase
    timerInterval: null, // Holder element for clearing active loops
    deployedDefenses: []
};

document.addEventListener("DOMContentLoaded", () => {
    injectBoardButton();
    injectTimerWidget();
    updateDashboard();
    triggerThreatWave();
});

function injectBoardButton() {
    const statusWidget = document.querySelector(".status-widget");
    const boardDiv = document.createElement("div");
    boardDiv.style.marginTop = "15px";
    boardDiv.style.paddingTop = "15px";
    boardDiv.style.borderTop = "1px solid var(--border-color)";
    boardDiv.innerHTML = `
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">Capital Allocation Crisis?</p>
        <button id="board-request-btn" class="btn-action" style="width: 100%; border-color: var(--warning); color: var(--warning);">
            💼 Pitch Board for Budget
        </button>
    `;
    statusWidget.appendChild(boardDiv);
    document.getElementById("board-request-btn").addEventListener("click", requestBoardBudget);
}

// NEW: Adds visual countdown component right above the log window console area
function injectTimerWidget() {
    const mainContent = document.querySelector(".sidebar");
    const timerDiv = document.createElement("div");
    timerDiv.className = "metric-card";
    timerDiv.style.borderColor = "var(--alert)";
    timerDiv.innerHTML = `
        <span class="metric-label" style="color: var(--alert);">⚠️ Incident Response SLA</span>
        <span class="metric-value" id="timer-display" style="color: var(--alert);">30s</span>
    `;
    // Insert immediately below the risk scorecard container element
    mainContent.insertBefore(timerDiv, mainContent.children[3]);
}

function updateDashboard() {
    document.getElementById("turn-count").innerText = `${state.turn} / ${state.maxTurns}`;
    document.getElementById("budget").innerText = `£${state.budget.toLocaleString()}`;
    document.getElementById("security-score").innerText = `${state.securityScore} / 100`;
    
    const scoreBar = document.getElementById("score-bar");
    scoreBar.style.width = `${state.securityScore}%`;
    
    if (state.securityScore < 45) {
        scoreBar.style.backgroundColor = "var(--alert)";
        document.getElementById("compliance-rating").innerText = "Non-Compliant";
        document.getElementById("compliance-rating").className = "text-alert";
    } else if (state.securityScore < 75) {
        scoreBar.style.backgroundColor = "var(--warning)";
        document.getElementById("compliance-rating").innerText = "Partial Alignment";
        document.getElementById("compliance-rating").className = "text-warning";
    } else {
        scoreBar.style.backgroundColor = "var(--success)";
        document.getElementById("compliance-rating").innerText = "ISO Certified / Compliant";
        document.getElementById("compliance-rating").className = "text-success";
    }

    const actionBtn = document.getElementById("next-turn-btn");
    const boardBtn = document.getElementById("board-request-btn");

    if (state.turn > state.maxTurns) {
        clearInterval(state.timerInterval);
        actionBtn.disabled = true;
        actionBtn.innerText = "Simulation Complete";
        actionBtn.style.backgroundColor = "var(--border-color)";
        if(boardBtn) boardBtn.disabled = true;
        document.getElementById("timer-display").innerText = "00s";
        triggerIncidentReport();
    } else if (state.isAttackActive) {
        if (state.controlDeployedThisTurn) {
            actionBtn.disabled = false;
            actionBtn.innerText = "Commit Response & Analyze Outcome";
            actionBtn.style.backgroundColor = "var(--success)";
        } else {
            actionBtn.disabled = true;
            actionBtn.innerText = "Mitigation Required...";
            actionBtn.style.backgroundColor = "var(--border-color)";
        }

        if (boardBtn) {
            const meetsBudgetCriteria = state.budget < 7000;
            if (!meetsBudgetCriteria) {
                boardBtn.disabled = true;
                boardBtn.style.opacity = "0.4";
            } else {
                boardBtn.disabled = state.boardRequestUsedThisTurn || state.controlDeployedThisTurn;
                boardBtn.style.opacity = (state.boardRequestUsedThisTurn || state.controlDeployedThisTurn) ? "0.4" : "1";
            }
        }
    } else {
        actionBtn.disabled = false;
        actionBtn.innerText = "Advance to Next Threat Wave";
        actionBtn.style.backgroundColor = "var(--accent)";
        if(boardBtn) boardBtn.disabled = true;
    }
}

// NEW: Countdown operational ticker loop logic
function startPhaseTimer() {
    clearInterval(state.timerInterval);
    state.timeLeft = 30;
    const display = document.getElementById("timer-display");
    display.innerText = `${state.timeLeft}s`;
    display.style.color = "var(--alert)";

    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        display.innerText = `${state.timeLeft}s`;

        if (state.timeLeft <= 0) {
            clearInterval(state.timerInterval);
            handleTimeoutBreach();
        }
    }, 1000);
}

// NEW: Trigger penalty calculation if student takes too long to analyze logs
function handleTimeoutBreach() {
    state.isAttackActive = false;
    state.controlDeployedThisTurn = true;
    
    logToTerminal(`[SLA BREACH - TIMEOUT] Incident Response window lapsed. The IT Security department suffered operational analysis paralysis.`, "fail");
    
    const structuralImpact = Math.floor(Math.random() * 8) + 15; // Higher impact for total failure to react
    state.securityScore = Math.max(0, state.securityScore - structuralImpact);
    logToTerminal(`[CRITICAL EXPLOITATION] Attacker executed MITRE ${state.activeAttack.mitre} with absolute freedom. Structural asset value fell by ${structuralImpact}!`, "fail");

    const actionBtn = document.getElementById("next-turn-btn");
    actionBtn.disabled = false;
    actionBtn.innerText = "Acknowledge Breach & Move Out";
    actionBtn.style.backgroundColor = "var(--alert)";
    
    actionBtn.onclick = () => {
        state.turn++;
        updateDashboard();
        if (state.turn <= state.maxTurns) {
            triggerThreatWave();
        }
    };

    updateDashboard();
    renderMarketplace();
}

function requestBoardBudget() {
    if (!state.isAttackActive || state.boardRequestUsedThisTurn || state.controlDeployedThisTurn) return;
    
    if (state.budget >= 7000) {
        logToTerminal(`[BOARD BLOCKED] Request denied automatically. Executive Policy: "Emergency capital injections are strictly unavailable while department reserves remain above £7,000."`, "warning");
        return;
    }

    state.boardRequestUsedThisTurn = true;
    logToTerminal(`\n[BOARD MEETING] Presenting fiscal deficit context and infrastructure incident risks to directors...`, "system");

    const successThreshold = state.securityScore > 50 ? 0.4 : 0.6; 
    const isApproved = Math.random() > successThreshold;

    if (isApproved) {
        const grantedAmount = 2500 + (Math.floor(Math.random() * 8) * 500); 
        state.budget += grantedAmount;
        logToTerminal(`[BOARD APPROVED] Crisis funding authorized. The board injects £${grantedAmount.toLocaleString()} into remediation lines.`, "success");
    } else {
        logToTerminal(`[BOARD REJECTED] Pitch failed. The Board demands self-sufficiency under current risk tolerances.`, "fail");
    }

    updateDashboard();
    renderMarketplace();
}

function generateProceduralAttack() {
    const archetype = attackArchetypes[Math.floor(Math.random() * attackArchetypes.length)];
    const variantName = archetype.variants[Math.floor(Math.random() * archetype.variants.length)];
    const specificTarget = archetype.systemTargets[Math.floor(Math.random() * archetype.systemTargets.length)];
    const sourceIp = randomIOCs.ips[Math.floor(Math.random() * randomIOCs.ips.length)];
    const badFile = randomIOCs.files[Math.floor(Math.random() * randomIOCs.files.length)];
    const badProcess = randomIOCs.processes[Math.floor(Math.random() * randomIOCs.processes.length)];

    let logTelemetry = "";
    if (archetype.mitre === "T1566" || archetype.mitre === "T1204") {
        logTelemetry = `Inbound event on ${specificTarget}. User opened attachment [${badFile}]. External Origin: [IP: ${sourceIp}].`;
    } else if (archetype.mitre === "T1110" || archetype.mitre === "T1190") {
        logTelemetry = `Inbound network spike hitting ${specificTarget}. Threat signature tracking connection payload from remote host ${sourceIp}. Multiple failures flagged.`;
    } else {
        logTelemetry = `Telemetry flag on host ${specificTarget}. Unauthorized hook call spawning process tree: "${badProcess}".`;
    }

    return {
        mitre: archetype.mitre,
        name: `${archetype.name} (${variantName})`,
        description: logTelemetry,
        counterId: archetype.counterId
    };
}

function triggerThreatWave() {
    if (state.turn > state.maxTurns) return;

    state.isAttackActive = true;
    state.controlDeployedThisTurn = false; 
    state.boardRequestUsedThisTurn = false;
    
    state.activeAttack = generateProceduralAttack();

    logToTerminal(`\n============== INCIDENT TRACKER: CYBER ATTACK PHASE ${state.turn} / ${state.maxTurns} ==============`, "warning");
    logToTerminal(`ALERT: Threat indicator generated!`, "fail");
    logToTerminal(`Vector Class: MITRE ATT&CK [${state.activeAttack.mitre}] - ${state.activeAttack.name}`, "warning");
    logToTerminal(`Raw SIEM Strings: ${state.activeAttack.description}`, "system");
    logToTerminal(`INSTRUCTION: Evaluate metrics. You have 30 seconds to lock in a mitigation plan or pitch the board.`, "system");

    startPhaseTimer(); // Start the countdown for this active phase
    updateDashboard();
    renderMarketplace();
}

function renderMarketplace() {
    const list = document.getElementById("controls-list");
    list.innerHTML = "";

    frameworkControls.forEach(def => {
        const alreadyOwns = state.deployedDefenses.includes(def.id);
        const canAfford = state.budget >= def.cost;
        
        let buttonText = `Deploy [£${def.cost.toLocaleString()}]`;
        if (alreadyOwns) {
            buttonText = "Re-verify Control (Free)";
        }

        const block = document.createElement("div");
        block.className = `control-block ${alreadyOwns ? 'deployed' : ''}`;
        
        const shouldDisable = !state.isAttackActive || state.controlDeployedThisTurn || (!alreadyOwns && !canAfford);

        block.innerHTML = `
            <div style="padding-right: 12px;">
                <h3 style="font-size:0.95rem; margin-bottom:4px;">${def.name}</h3>
                <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">${def.description}</p>
                <div class="meta-tags">
                    <span class="tag mitre">Mitigates: ${def.mitigates}</span>
                    <span class="tag ncsc">${def.ncsc}</span>
                    <span class="tag iso">${def.iso}</span>
                </div>
            </div>
            <div>
                <button id="btn-${def.id}" class="btn-action" ${shouldDisable ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
        list.appendChild(block);

        if (state.isAttackActive && !state.controlDeployedThisTurn && (alreadyOwns || canAfford)) {
            document.getElementById(`btn-${def.id}`).addEventListener("click", () => handleResponseSelection(def));
        }
    });
}

function handleResponseSelection(selectedControl) {
    clearInterval(state.timerInterval); // Stop ticking the moment a selection locks in
    state.controlDeployedThisTurn = true;
    
    const matchesVector = selectedControl.mitigates.includes(state.activeAttack.mitre);
    const alreadyOwns = state.deployedDefenses.includes(selectedControl.id);

    if (!alreadyOwns) {
        state.budget -= selectedControl.cost;
        state.deployedDefenses.push(selectedControl.id);
        logToTerminal(`[RESPONSE REGISTERED] Expended £${selectedControl.cost.toLocaleString()} to stage defense architecture. Market catalog locked.`, "system");
    } else {
        logToTerminal(`[RESPONSE REGISTERED] Staged pre-existing deployment: ${selectedControl.name}. Market catalog locked.`, "success");
    }

    const actionBtn = document.getElementById("next-turn-btn");
    actionBtn.onclick = () => {
        state.isAttackActive = false;
        
        if (matchesVector) {
            state.securityScore = Math.min(100, state.securityScore + selectedControl.boost);
            logToTerminal(`[MITIGATION SUCCESS] Impact prevented! Chosen blueprint matched threat criteria perfectly.`, "success");
        } else {
            const structuralImpact = Math.floor(Math.random() * 8) + 12;
            state.securityScore = Math.max(0, state.securityScore - structuralImpact);
            logToTerminal(`[BREACH DETECTED] Control mismatch. Threat actor bypassed selected posture. Infrastructure score down by ${structuralImpact}!`, "fail");
        }

        state.turn++;
        updateDashboard();
        if (state.turn <= state.maxTurns) {
            triggerThreatWave();
        }
    };

    updateDashboard();
    renderMarketplace();
}

function logToTerminal(msg, mode) {
    const feed = document.getElementById("log-feed");
    const entry = document.createElement("div");
    entry.className = `log-entry ${mode}`;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.innerText = `[${timestamp}] ${msg}`;
    
    feed.appendChild(entry);
    feed.scrollTop = feed.scrollHeight;
}

// Clear any orphaned processes if structural teardown forces early stops
function triggerIncidentReport() {
    clearInterval(state.timerInterval);
    logToTerminal(`\n================================================`, "system");
    logToTerminal(`20-CYCLE OVERALL STRATEGIC REVIEW COMPLETE`, "system");
    logToTerminal(`Final Organizational Health Index: ${state.securityScore}/100.`, state.securityScore >= 75 ? "success" : "fail");
    
    if (state.securityScore >= 75) {
        logToTerminal(`AUDIT VERDICT: DISTINCTION. Robust infrastructure mapping has kept risk profiles within strict corporate compliance targets. Outstanding work.`, "success");
    } else if (state.securityScore >= 50) {
        logToTerminal(`AUDIT VERDICT: ACCEPTABLE PASS. High residual volatility noted. Additional governance frameworks required to shield systemic gaps.`, "warning");
    } else {
        logToTerminal(`AUDIT VERDICT: COMPROMISED. The network has succumbed to catastrophic persistent exploitation cascades. Heavy non-compliance fines looming under standard audits.`, "fail");
    }
}