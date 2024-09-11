<form action="/update" method="POST">
    <input type="hidden" name="index" value="<%= index %>">
    
    <label for="batch">Batch:</label>
    <input type="text" name="batch" id="batch" value="<%= entry.batch %>" required>
  
    <label for="teacher">Teacher:</label>
    <input type="text" name="teacher" id="teacher" value="<%= entry.teacher %>" required>
  
    <label for="classroom">Classroom:</label>
    <input type="text" name="classroom" id="classroom" value="<%= entry.classroom %>" required>
  
    <label for="day">Day:</label>
    <input type="text" name="day" id="day" value="<%= entry.day %>" required>
  
    <label for="startTime">Start Time:</label>
    <input type="number" name="startTime" id="startTime" value="<%= entry.startTime %>" required>
  
    <label for="endTime">End Time:</label>
    <input type="number" name="endTime" id="endTime" value="<%= entry.endTime %>" required>
  
    <button type="submit">Update</button>
  </form>
  
