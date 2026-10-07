# BackTrack - Student Backlog & Academic Progress Management System

BackTrack is a complete, Python-based academic management system designed to streamline the tracking and resolution of student backlogs. Built entirely with Streamlit, it provides role-based dashboards for Students, Faculty, and Administrators.

## Features
- **Three distinct roles:** Student, Faculty, Admin
- **Automated Workflow:** Track backlog progress from Pending to Cleared
- **Real-time Notifications:** In-app updates
- **Analytics & PDF Reports:** Rich charts and downloadable tables
- **Document Uploads:** Store forms and marks processing seamlessly

## Setup Instructions

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Initialize the database and sample data:
   ```bash
   python app/data/sample_data.py
   ```

3. Run the Streamlit app:
   ```bash
   streamlit run main.py
   ```

## Demo Credentials
After initialization, the following users are created:

- **Admin:**
  - Username: `admin`
  - Password: `admin123`

- **Faculty:**
  - Username: `faculty1`
  - Password: `fac123`

- **Student:**
  - Username: `student1`
  - Password: `stu123`
