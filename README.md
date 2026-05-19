# 🛡️ ShieldsUp: Cyber Security RiskEngine Simulation

An interactive, browser-based Incident Response and Risk Management simulation designed for Computing and Cyber Security students. 

This application operates completely client-side, making it perfect for hosting for free via **GitHub Pages**.

---

## 🎯 Educational Objectives

As an Information Security Manager, you are dropped into a live corporate environment facing an active, multi-stage cyber campaign. Your objectives are:
1. **Analyze Live Telemetry:** Read real-time SIEM strings and parse technical indicators of compromise (IOCs).
2. **Map Threats to Frameworks:** Identify the active **MITRE ATT&CK** technique being used by the adversary.
3. **Deploy Compliant Defenses:** Spend your operational budget to deploy countermeasures directly mapped to **NCSC Active Cyber Defence blueprints** and **ISO 27001:2022 Annex A controls**.
4. **Manage Financial Constraints:** Navigate a strict budget threshold and dynamically pitch the Executive Board for capital injections when resources run low.

---

## 🕹️ Simulation Mechanics & Rules

* **20 Phase Scenario:** The simulation plays out over 20 consecutive threat waves. Each wave features a procedurally generated attack variation.
* **Locked Defenses:** When a threat vector emerges, your engineering choice is absolute. Selecting a framework control locks the marketplace panel instantly for that round.
* **SLA Countdown Timer:** You have exactly **30 seconds** per phase to analyze log data and commit a response. Failure to act within the window results in *Analysis Paralysis*, allowing the threat actor to execute with 100% efficiency and maximum structural asset impact.
* **Board Funding Policy:** If your operational budget drops **below £7,000**, you may use your turn to pitch the executive board for emergency capital. The board may reject your proposal or grant a randomized injection (£2,500 - £6,000) based on your current corporate security rating. *Pitches are blocked if your cash reserves are £7,000 or above.*

---

## 📊 Framework Control Matrix Reference

The RiskEngine leverages an integrated security architecture matrix. Review these mappings to make informed decisions under pressure:

| MITRE ATT&CK ID | Attack Archetype | Recommended NCSC Guidance | Targeted ISO 27001:2022 Control |
| :--- | :--- | :--- | :--- |
| **T1566** | Phishing Attempt | Defending Your Organisation from Phishing | **A.8.10** Information Deletion & Filtering |
| **T1110** | Brute Force Vector | Identity & Access Management Policy | **A.8.5** Secure Authentication |
| **T1059** | Command & Script Abuse | Introduction to Logging / Logging Made Easy | **A.8.16** Monitoring Activities |
| **T1021** | Remote Services (Lateral) | Enterprise Network Segmentation Design | **A.8.22** Network Segregation |
| **T1190** | Exploit Public Application | Vulnerability Management Principles | **A.8.19** Operational Privileges |
| **T1068** | Privilege Escalation | Secure Device Guidelines | **A.8.17** Asset Installation |
| **T1078** | Valid Accounts Abuse | Privileged Identity Control Blueprints | **A.5.15** Access Rights |
| **T1204** | User Execution Trigger | End-User Device Security Profiles | **A.8.18** Use of Utility Programs |

---

## 🚀 Deployment Instructions (GitHub Pages)

To launch this interactive tool on your own GitHub account:

1. **Fork or Create a New Repository:** Create a public repository named `cyber-risk-engine`.
2. **Upload the Code Structure:** Ensure your directory looks exactly like this:
   ```text
   ├── index.html
   ├── README.md
   ├── css/
   │   └── styles.css
   └── js/
       └── app.js
