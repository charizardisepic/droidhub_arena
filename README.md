# DroidHub

![DroidHub Banner](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Our%20vision_pages-to-jpg-0004.jpg-P5vlBG70H5qmo7jk4UuLelSkjgbtBh.jpeg)

DroidHub is a decentralized web application that brings real-world exploration and interaction to the blockchain. Inspired by platforms like Twitch, DroidHub enables users to watch live streams from physical robots (rovers) deployed in real environments—like city streets or event venues. Viewers can stake AVAX to compete for control of the bot, with the highest staker receiving live command privileges.

Staking and control rights are transparently verified through Avalanche’s C-Chain, ensuring trustless interaction and ownership logic. Instead of routing bot commands through centralized servers, DroidHub uses a custom Layer 1 chain, purpose-built to handle real-time robot commands. This is made possible by Avalanche’s ICM, which allows for low-latency, high-throughput messaging ideal for physical-world feedback loops and managing large fleets of bots.

Use cases include city exploration, real-world wildlife interactions, remote tourism, physical NFT integrations, and gamified robotic experiences—all governed by decentralized incentives.

DroidHub redefines telepresence and robotics control by merging blockchain incentives, decentralized infrastructure, and real-world interaction into a seamless, on-chain experience.

## Features
- Live robot video feed (Twitch)
- Stake AVAX to gain minute-based control handover
- Queue-based robot driving (keyboard, UI, or mobile)
- Keyboard ArrowKey mode for rapid, continuous input
- Mobile-first, responsive UI (desktop & mobile layouts)
- Live command queue preview and instant feedback
- Staking leaderboard, robot status, and location map
- Secure wallet connect (RainbowKit)

## Technical Details

**Tech Stack & Architecture:**
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Wallet Integration:** RainbowKit (EVM wallet connect)
- **Blockchain:** Avalanche C-Chain (staking, control logic), custom Layer 1 for real-time robot command queue
- **Backend/API:** Node.js server (Render.com) for robot command queue and live status ([API code](https://github.com/bonusducks777/droidhub/tree/main/botcontrol) – GitHub)
- **Smart Contract:** Custom staking and control contract for DroidHub ([Contract code](https://github.com/bonusducks777/droidhub/blob/main/droidhub.sol) – GitHub)
- **Robot Hardware:** Prototype rover built with ESP32-C3, L298N motor driver, and DC motors; receives commands from the API and streams video via Twitch
- **Live Video:** Twitch embedded player for real-time robot POV
- **Deployment:** Vercel (frontend), Render.com (API)

**How it works under the hood:**
- Users connect their wallet and stake AVAX to compete for control. The highest staker is granted exclusive command rights for one-minute intervals, enforced by the smart contract on Avalanche.
- The frontend communicates with a Node.js API (deployed on Render.com) to queue and relay robot commands. When a user presses a control button, a command is POSTed to the API, which then relays it to the robot in real time.
- The robot (ESP32-C3) polls the API for new commands, executes them, and streams live video to Twitch. The UI displays the live feed, command queue, and staking leaderboard.
- All staking, control handover, and user balances are managed on-chain for transparency and trustlessness.

**Integrations:**
- Avalanche C-Chain (staking, control)
- Custom Layer 1 for robot command queue (via Avalanche ICM)
- Render.com Node.js API ([API repo](https://github.com/bonusducks777/droidhub/tree/main/botcontrol) – GitHub)
- Twitch (video streaming)
- RainbowKit (wallet connect)

**What we built during the hackathon:**
- Full-stack decentralized robot control dApp (frontend, backend, smart contract)
- Custom staking and control smart contract
- Node.js API for real-time robot command queue
- Prototype robot: ESP32-C3 microcontroller, L298N motor driver, DC motors, WiFi streaming
- Live video integration with Twitch
- Responsive, desktop and mobile UI with live queue, leaderboard, and status overlays

**Demo Video:** [Watch here](https://youtu.be/3AMGjwI3Pv8)
**GitHub Repo:** [View source](https://github.com/bonusducks777/droidhub)

## Applications
- Remote vehicles, drones, and city explorers
- Games, experiments, and creative robots
- Animal feeders, museum guides, and more

---
MIT License
