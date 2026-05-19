const frameworkControls = [
    { id: "def-1", name: "Enforce Multi-Factor Authentication (MFA)", description: "Protects enterprise identities and administrative entrypoints using out-of-band session tokens.", cost: 4000, mitigates: "T1110", ncsc: "NCSC: Identity Management", iso: "ISO 27001 A.8.5", boost: 8 },
    { id: "def-2", name: "Deploy Centralised Log Aggregation (SIEM)", description: "Ingests host telemetry, network traffic flows, and access events into an automated parsing engine.", cost: 6500, mitigates: "T1059", ncsc: "NCSC: Logging Made Easy", iso: "ISO 27001 A.8.16", boost: 10 },
    { id: "def-3", name: "Implement Internal Network Segmentation", description: "Enforces isolation barriers between production segments via internal firewalls to stop lateral pivots.", cost: 5000, mitigates: "T1021", ncsc: "NCSC: Enterprise Segregation", iso: "ISO 27001 A.8.22", boost: 8 },
    { id: "def-4", name: "Secure Email Gateways & Phishing Filters", description: "Applies heuristic content analysis, SPF/DKIM verification, and link rewriting to corporate messaging inbound queues.", cost: 3000, mitigates: "T1566", ncsc: "NCSC: Phishing Defenses", iso: "ISO 27001 A.8.10", boost: 6 },
    { id: "def-5", name: "Automated Patch Management Infrastructure", description: "Schedules automated scanning cycles and distribution of operating system and third-party hotfixes.", cost: 4500, mitigates: "T1190", ncsc: "NCSC: Vulnerability Management", iso: "ISO 27001 A.8.19", boost: 8 },
    { id: "def-6", name: "Endpoint Detection and Response (EDR) Agents", description: "Monitors process trees and file integrity on physical devices using behavioral heuristics to catch zero-days.", cost: 7000, mitigates: "T1068", ncsc: "NCSC: Device Security", iso: "ISO 27001 A.8.17", boost: 12 },
    { id: "def-7", name: "Principle of Least Privilege (RBAC Execution)", description: "Strictly audits administrative groups, strips local administrative rights, and implements Role-Based Access Control.", cost: 2500, mitigates: "T1078", ncsc: "NCSC: Identity Management", iso: "ISO 27001 A.5.15", boost: 6 },
    { id: "def-8", name: "Application Whitelisting & AppLocker Policies", description: "Enforces strict structural rules blocking unapproved binary software applications from loading on corporate hosts.", cost: 3500, mitigates: "T1204", ncsc: "NCSC: Device Security", iso: "ISO 27001 A.8.18", boost: 7 }
];

const attackArchetypes = [
    { mitre: "T1566", name: "Phishing Attempt", variants: ["Spearphishing Link", "Weaponized Attachment"], counterId: "def-4", systemTargets: ["HR Inbox", "Finance Mail Server"] },
    { mitre: "T1110", name: "Brute Force Vector", variants: ["SSH Dictionary Flooding", "RDP Spray Attack"], counterId: "def-1", systemTargets: ["Perimeter DMZ Router", "Public Cloud Gateway"] },
    { mitre: "T1059", name: "Command Interpreter Abuse", variants: ["Obfuscated PowerShell Execution", "Malicious Bash Sequence"], counterId: "def-2", systemTargets: ["Domain Workstation", "Linux App Server"] },
    { mitre: "T1021", name: "Remote Services Lateral Hops", variants: ["RDP Session Hijacking", "SMB Mount Mapping"], counterId: "def-3", systemTargets: ["Internal Active Directory", "Payroll DB Server"] },
    { mitre: "T1190", name: "Exploit Public Application", variants: ["SQL Injection Exploitation", "Log4j RCE Trigger String"], counterId: "def-5", systemTargets: ["Corporate Website", "E-Commerce Gateway"] },
    { mitre: "T1068", name: "Exploitation for Privilege Escalation", variants: ["Kernel Memory Space Leak", "UAC Bypass Execution"], counterId: "def-6", systemTargets: ["Workstation Console", "File Server Core"] },
    { mitre: "T1078", name: "Valid Accounts Abuse", variants: ["Stolen API Replay", "Leaked Admin Session"], counterId: "def-7", systemTargets: ["AWS Cloud Console", "Internal Git Repo"] },
    { mitre: "T1204", name: "User Execution Trigger", variants: ["Untrusted Freeware Install", "Malicious Browser Extension"], counterId: "def-8", systemTargets: ["Reception Desktop Host", "Marketing Laptop Node"] }
];

const randomIOCs = {
    ips: ["185.220.101.4", "45.227.254.12", "91.241.19.82"],
    files: ["invoice_archive.zip", "overdue_payment.xlsm", "patch.exe"],
    processes: ["powershell.exe -nop -w hidden", "cmd.exe /c certutil", "bash -i"]
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
    timeLeft: 30,
    timerInterval: null,
    deployedDefenses: []
};

document.addEventListener("DOMContentLoaded", () => {
    injectBoardButton();
    updateDashboard();
    triggerThreatWave();
    document.getElementById("next-turn-btn").addEventListener("click", commitTurnAction);
});

function injectBoardButton() {
    if (document.getElementById("board-request-btn")) return;
    const sidebar = document.querySelector(".sidebar");
    
    const container = document.createElement("div");
    container.id = "board-btn-container";
    container.style.width = "100%";
    container.innerHTML = `
        <button id="board-request-btn" class="btn-action" style="border-color: var(--warning); color: var(--warning);">
            💼 Pitch Board for Budget
        </button>
    `;
    
    sidebar.insertBefore(container, document.getElementById("next-turn-btn"));
    document.getElementById("board-request-btn").addEventListener("click", requestBoardBudget);
}

function updateDashboard() {
    document.getElementById("turn-count").innerText = `${state.turn} / ${state.maxTurns}`;
    document.getElementById("budget").innerText = `£${state.budget.toLocaleString()}`;
    document.getElementById("security-score").innerText = `${state.securityScore} / 100`;
    
    const scoreBar = document.getElementById("score-bar");
    if(scoreBar) scoreBar.style.width = `${state.securityScore}%`;
    
    const rating = document.getElementById("compliance-rating");
    if (state.securityScore < 45) {
        if(scoreBar) scoreBar.style.backgroundColor = "var(--alert)";
        rating.innerText = "Non-Compliant";
        rating.className = "text-alert";
    } else if (state.securityScore < 75) {
        if(scoreBar) scoreBar.style.backgroundColor = "var(--warning)";
        rating.innerText = "Partial Alignment";
        rating.className = "text-warning";
    } else {
        if(scoreBar) scoreBar.style.backgroundColor = "var(--success)";
        rating.innerText = "ISO Certified / Compliant";
        rating.className = "text-success";
    }

    const actionBtn = document.getElementById("next-turn-btn");
    const boardBtn = document.getElementById("board-request-btn");

    if (state.turn > state.maxTurns) {
        clearInterval(state.timerInterval);
        actionBtn.disabled = true;
        actionBtn.innerText = "Simulation Complete";
        if(boardBtn) boardBtn.disabled = true;
        document.getElementById("timer-display").innerText = "00s";
        triggerIncidentReport();
    } else if (state.isAttackActive) {
        if (state.controlDeployedThisTurn) {
            actionBtn.disabled = false;
            actionBtn.innerText = "Commit Selected Control Plan";
            actionBtn.style.backgroundColor = "var(--success)";
        } else {
            actionBtn.disabled = true;
            actionBtn.innerText = "Mitigation Action Required...";
            actionBtn.style.backgroundColor = "var(--border-color)";
        }

        if (boardBtn) {
            boardBtn.disabled = (state.budget >= 7000 || state.boardRequestUsedThisTurn || state.controlDeployedThisTurn);
            boardBtn.style.opacity = boardBtn.disabled ? "0.4" : "1";
        }
    } else {
        actionBtn.disabled = false;
        actionBtn.innerText = "Advance to Next Wave";
        actionBtn.style.backgroundColor = "var(--accent)";
        if(boardBtn) boardBtn.disabled = true;
    }
}

function startPhaseTimer() {
    clearInterval(state.timerInterval);
    state.timeLeft = 30;
    const display = document.getElementById("timer-display");
    display.innerText = `${state.timeLeft}s`;

    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        display.innerText = `${state.timeLeft}s`;

        if (state.timeLeft <= 0) {
            clearInterval(state.timerInterval);
            handleTimeoutBreach();
        }
    }, 1000);
}

function handleTimeoutBreach() {
    state.isAttackActive = false;
    state.controlDeployedThisTurn = true;
    
    logToTerminal(`[SLA BREACH - TIMEOUT] Incident Response window lapsed. System suffered paralysis impact.`, "fail");
    
    const structuralImpact = Math.floor(Math.random() * 8) + 15; 
    state.securityScore = Math.max(0, state.securityScore - structuralImpact);
    logToTerminal(`[CRITICAL] Attacker bypassed standard frameworks. Health rating down by ${structuralImpact}!`, "fail");

    updateDashboard();
    renderMarketplace();
}

function requestBoardBudget() {
    if (!state.isAttackActive || state.boardRequestUsedThisTurn || state.controlDeployedThisTurn || state.budget >= 7000) return;

    state.boardRequestUsedThisTurn = true;
    logToTerminal(`\n[BOARD MEETING] Presenting fiscal deficit context and infrastructure risks...`, "system");

    const isApproved = Math.random() > (state.securityScore > 50 ? 0.4 : 0.6);

    if (isApproved) {
        const grantedAmount = 2500 + (Math.floor(Math.random() * 8) * 500); 
        state.budget += grantedAmount;
        logToTerminal(`[BOARD APPROVED] Emergency funding authorized: +£${grantedAmount.toLocaleString()}`, "success");
    } else {
        logToTerminal(`[BOARD REJECTED] Pitch failed. Optimize existing assets.`, "fail");
    }

    updateDashboard();
    renderMarketplace();
}

function triggerThreatWave() {
    if (state.turn > state.maxTurns) return;

    state.isAttackActive = true;
    state.controlDeployedThisTurn = false; 
    state.boardRequestUsedThisTurn = false;
    
    const archetype = attackArchetypes[Math.floor(Math.random() * attackArchetypes.length)];
    state.activeAttack = {
        mitre: archetype.mitre,
        name: `${archetype.name} (${archetype.variants[Math.floor(Math.random() * archetype.variants.length)]})`,
        description: `Flagged on ${archetype.systemTargets[Math.floor(Math.random() * archetype.systemTargets.length)]}. Target IP Indicator: [${randomIOCs.ips[Math.floor(Math.random() * randomIOCs.ips.length)]}].`,
        counterId: archetype.counterId
    };

    logToTerminal(`\n============== LIVE WAVE INCIDENT ${state.turn} / ${state.maxTurns} ==============`, "warning");
    logToTerminal(`ALERT: Threat indicator generated! Vector: MITRE ATT&CK [${state.activeAttack.mitre}]`, "warning");
    logToTerminal(`Raw Log Trace: ${state.activeAttack.description}`, "system");

    startPhaseTimer(); 
    updateDashboard();
    renderMarketplace();
}

function renderMarketplace() {
    const list = document.getElementById("controls-list");
    list.innerHTML = "";

    frameworkControls.forEach(def => {
        const alreadyOwns = state.deployedDefenses.includes(def.id);
        const canAfford = state.budget >= def.cost;
        const shouldDisable = !state.isAttackActive || state.controlDeployedThisTurn || (!alreadyOwns && !canAfford);

        const block = document.createElement("div");
        block.className = `control-block ${alreadyOwns ? 'deployed' : ''}`;
        block.innerHTML = `
            <div>
                <h3 style="font-size:0.9rem; margin-bottom:4px;">${def.name}</h3>
                <p style="font-size:0.75rem; color:var(--text-secondary); line-height:1.4; margin-bottom:6px;">${def.description}</p>
                <div class="meta-tags">
                    <span class="tag mitre">Mitigates: ${def.mitigates}</span>
                    <span class="tag ncsc">${def.ncsc}</span>
                    <span class="tag iso">${def.iso}</span>
                </div>
            </div>
            <button id="btn-${def.id}" class="btn-primary" style="font-size:0.8rem;" ${shouldDisable ? 'disabled' : ''}>
                ${alreadyOwns ? 'Active' : `Deploy [£${def.cost}]`}
            </button>
        `;
        list.appendChild(block);

        if (!shouldDisable) {
            document.getElementById(`btn-${def.id}`).addEventListener("click", () => handleResponseSelection(def));
        }
    });
}

function handleResponseSelection(selectedControl) {
    clearInterval(state.timerInterval); 
    state.controlDeployedThisTurn = true;
    
    const matchesVector = selectedControl.mitigates.includes(state.activeAttack.mitre);
    const alreadyOwns = state.deployedDefenses.includes(selectedControl.id);

    if (!alreadyOwns) {
        state.budget -= selectedControl.cost;
        state.deployedDefenses.push(selectedControl.id);
        logToTerminal(`[RESPONSE REGISTERED] Expended £${selectedControl.cost} to implement defense framework line.`, "system");
    } else {
        logToTerminal(`[RESPONSE REGISTERED] Re-activated existing control asset: ${selectedControl.name}.`, "success");
    }

    state.nextActionStep = () => {
        state.isAttackActive = false;
        if (matchesVector) {
            state.securityScore = Math.min(100, state.securityScore + selectedControl.boost);
            logToTerminal(`[MITIGATION SUCCESS] Target neutralized via framework guidelines.`, "success");
        } else {
            const structuralImpact = Math.floor(Math.random() * 8) + 12;
            state.securityScore = Math.max(0, state.securityScore - structuralImpact);
            logToTerminal(`[BREACH CRITICAL] Control mismatch! Threat vector bypassed defenses. Health penalty: -${structuralImpact}`, "fail");
        }
        state.turn++;
        updateDashboard();
        if (state.turn <= state.maxTurns) triggerThreatWave();
    };

    updateDashboard();
    renderMarketplace();
}

function commitTurnAction() {
    if (state.controlDeployedThisTurn && state.nextActionStep) {
        state.nextActionStep();
        state.nextActionStep = null;
    } else if (!state.isAttackActive) {
        triggerThreatWave();
    }
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

function triggerIncidentReport() {
    logToTerminal(`\n================================================`, "system");
    logToTerminal(`20-CYCLE CONSOLE REVIEW COMPLETE`, "system");
    logToTerminal(`Final Health Posture Index: ${state.securityScore}/100.`, state.securityScore >= 75 ? "success" : "fail");
}
