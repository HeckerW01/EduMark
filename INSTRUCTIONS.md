# ClassPDF - How to Run the Application

## Getting Started

1. Download and unzip the application files to a folder on your computer.

2. Open the unzipped folder in a terminal/command prompt.

3. Use one of the following methods to start a simple local web server:

   ### Option 1: Using Python (if you have Python installed)
   ```
   # For Python 3
   python -m http.server
   
   # For Python 2
   python -m SimpleHTTPServer
   ```

   ### Option 2: Using Node.js (if you have Node.js installed)
   ```
   # Install http-server globally if you haven't already
   npm install -g http-server
   
   # Run the server
   http-server
   ```

   ### Option 3: Using PHP (if you have PHP installed)
   ```
   php -S localhost:8000
   ```

4. Open your web browser and navigate to:
   ```
   http://localhost:8000
   ```
   (or the port specified by your chosen server option)

## Using the Application

### As a Teacher:

1. On the homepage, click "I'm a Teacher" or "Teacher Login".
2. Register for an account if you don't have one yet.
3. After logging in, you'll be directed to the Teacher Dashboard.
4. Upload PDFs by either:
   - Dragging and dropping PDF files into the upload area, or
   - Clicking the "Browse Files" button and selecting PDFs
5. Create assignments by:
   - Clicking on the "Assignments" tab in the sidebar
   - Clicking "Create New Assignment"
   - Filling out the assignment details, selecting one of your uploaded PDFs
   - Click "Create Assignment"
6. Track student submissions in the "Grading" tab

### As a Student:

1. On the homepage, click "I'm a Student" or "Student Login".
2. Register for an account if you don't have one yet.
3. After logging in, you'll be directed to the Student Dashboard.
4. View your current assignments in the "Assignments" tab.
5. Work on an assignment by:
   - Clicking "Work on Assignment" for any available assignment
   - Using the virtual tools (pen, highlighter, eraser, text) to complete the assignment
   - Saving your progress as you work using the "Save Progress" button
   - Submitting the completed assignment with the "Submit Assignment" button
6. Review your completed assignments in the "Completed" tab

## Important Notes

- This is a client-side demo application. All data is stored in your browser's LocalStorage.
- Data will persist between page refreshes but will be lost if you clear your browser cache.
- The PDF functionality is simulated with placeholders - in a real application, you would use actual PDF.js for rendering.
- Using a local web server is necessary because modern browsers restrict JavaScript's LocalStorage API when opening HTML files directly from the filesystem.

## Troubleshooting

- If the application doesn't work properly, check your browser console for error messages (press F12 in most browsers).
- Make sure JavaScript is enabled in your browser.
- If you see a message indicating that LocalStorage is not available, make sure you're accessing the application through a web server (http://localhost) and not directly from the file system (file://). 