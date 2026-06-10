# 🚀 Streaming Event Anomaly Detector

A real-time monitoring and anomaly detection platform that continuously analyzes streaming events, detects unusual behavior using statistical techniques, and leverages Google Gemini AI to provide intelligent root-cause analysis and mitigation recommendations.

---

## 🌐 Live Demo

🔗 **Deployed Application**
https://streaming-event-anomaly-detector-1.onrender.com

---

## 📖 Overview

Modern applications generate thousands of events every second. Detecting anomalies manually is difficult and often leads to delayed responses and operational issues.

The **Streaming Event Anomaly Detector** addresses this challenge by monitoring event streams in real time, identifying abnormal patterns, generating alerts, and providing AI-powered analysis to help users understand and resolve incidents quickly.

The platform combines real-time event monitoring, statistical anomaly detection, role-based access control, analytics dashboards, and automated reporting into a single user-friendly interface.

---

## ✨ Features

### 📊 Real-Time Event Monitoring

* Live event stream simulation
* Continuous event tracking
* Real-time metrics updates
* Dynamic performance visualization

### 🚨 Anomaly Detection

* Statistical threshold-based detection
* Spike detection
* Drop detection
* Running average monitoring
* Variance and trend analysis

### 🤖 AI-Powered Root Cause Analysis

* Google Gemini integration
* Automated anomaly explanation
* Root-cause identification
* Actionable recommendations
* Intelligent alert investigation

### 👥 Role-Based Access Control (RBAC)

* Admin role management
* Analyst access
* Operator access
* Secure user authentication
* Permission-based actions

### 📈 Analytics Dashboard

* Interactive charts
* Event trend visualization
* Performance monitoring
* Historical analysis
* System health indicators

### 🔍 Stream Explorer

* Event searching
* Filtering capabilities
* Historical log analysis
* Deep-dive investigation tools

### 📄 PDF Report Generation

* Automated report creation
* Incident summaries
* Performance audits
* Downloadable PDF reports

---

## 🏗️ System Architecture

```text
User Interface (React + TypeScript)
                │
                ▼
        Express Backend API
                │
                ▼
      Anomaly Detection Engine
                │
                ▼
         Google Gemini AI
                │
                ▼
      Alerts • Analysis • Reports
```

---

## 🛠️ Technology Stack

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Motion

### Backend

* Node.js
* Express.js
* ESBuild

### AI Integration

* Google Gemini API (`@google/genai`)

### Reporting

* PDFKit

### Deployment

* Render

---

## 📂 Project Structure

```text
.
├── src/
│   ├── components/
│   │   ├── AlertsCenter.tsx
│   │   ├── AnalyticsView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── DocumentsView.tsx
│   │   ├── ExplorerView.tsx
│   │   ├── LoginView.tsx
│   │   ├── MonitorView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── Sidebar.tsx
│   │   └── UserManagement.tsx
│   │
│   ├── utils/
│   │   └── api.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
│
├── server.ts
├── generate-pdfs.ts
├── anomaly_detector_db.json
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
```

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/streaming-event-anomaly-detector.git
cd streaming-event-anomaly-detector
```

### Install Dependencies

```bash
npm install
```

---

## 💻 Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

### Production Build

Build the frontend and backend:

```bash
npm run build
```

---

### Start Production Server

```bash
npm start
```

---

## 🌍 Deployment

The application is deployed on Render.

### Build Command

```bash
npm install && npm run build
```

### Start Command

```bash
npm start
```

### Required Environment Variables

```env
NODE_ENV=production
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 🎯 Use Cases

* Real-Time Event Monitoring
* Operational Intelligence
* Infrastructure Monitoring
* Application Health Tracking
* AI-Assisted Incident Investigation
* Stream Processing Analytics
* Performance Monitoring Systems

---

## 🔒 Security Features

* Role-Based Access Control
* Secure Authentication
* Protected Administrative Actions
* Server-Side AI Processing
* Controlled User Permissions

---

## 📸 Dashboard Modules

### Dashboard

Provides a real-time overview of event streams and system health.

### Alert Center

Displays detected anomalies and AI-generated insights.

### Analytics

Visualizes trends, metrics, and performance statistics.

### Stream Explorer

Allows users to search and investigate historical data.

### User Management

Administrative controls for managing users and permissions.

### Settings

Configuration options for anomaly thresholds and monitoring parameters.

### Documents

Generate downloadable PDF reports and audits.

---

## 🧠 Anomaly Detection Workflow

1. Events are generated or received.
2. The monitoring engine calculates statistical metrics.
3. Abnormal spikes or drops are detected.
4. Alerts are generated instantly.
5. Gemini AI analyzes the anomaly.
6. Root-cause explanations and recommendations are displayed.
7. Reports can be exported as PDFs.

---

## 👨‍💻 Project Highlights

* Real-time event monitoring platform
* Statistical anomaly detection engine
* Google Gemini AI integration
* Interactive analytics dashboard
* Secure RBAC implementation
* Automated PDF report generation
* Cloud deployment using Render

---

## 📚 Future Enhancements

* Real-time WebSocket streaming
* Email and SMS notifications
* Multi-tenant architecture
* Advanced machine learning models
* Database integration
* Custom anomaly detection rules
* Mobile application support

---

## 📜 License

This project is developed for educational, research, and demonstration purposes.

---

## 👥 Team Project

Streaming Event Anomaly Detector demonstrates modern full-stack development practices by combining:

* Real-Time Data Processing
* AI-Powered Analysis
* Secure User Management
* Interactive Dashboards
* Cloud Deployment
* Automated Reporting

Designed and developed as a scalable, production-ready monitoring solution.
