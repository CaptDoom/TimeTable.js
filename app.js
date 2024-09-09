const express = require('express');
const path = require('path');
const app = express();
const port = 8000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Constants
const classrooms = Array.from({ length: 20 }, (_, i) => `C${i + 1}`);
const teachers = Array.from({ length: 4 }, (_, i) => `T${i + 1}`);
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const classDurations = [1, 2];
const batches = Array.from({ length: 5 }, (_, i) => `B${i + 1}`);

// Initialize time slots for each day
const timeSlots = {};
days.forEach(day => {
    timeSlots[day] = Array.from({ length: 10 }, (_, hour) => [8 + hour, 9 + hour]);
});

// Helper function to get a random time slot
function getRandomTimeSlot(day) {
    const slots = timeSlots[day];
    if (slots.length === 0) {
        throw new Error(`No time slots available for ${day}`);
    }
    return slots[Math.floor(Math.random() * slots.length)];
}

const timetable = [];
const classesPerBatch = 25;
const numClassesPerDay = {};
days.forEach(day => {
    numClassesPerDay[day] = Math.floor(Math.random() * 3) + 3;
});

// Generate timetable
batches.forEach(batch => {
    let totalClassesScheduled = 0;
    days.forEach(day => {
        let numClasses = numClassesPerDay[day];
        if (totalClassesScheduled + numClasses > classesPerBatch) {
            numClasses = classesPerBatch - totalClassesScheduled;
        }

        for (let i = 0; i < numClasses; i++) {
            if (timeSlots[day].length === 0) {
                // Reset time slots for the day if empty
                timeSlots[day] = Array.from({ length: 10 }, (_, hour) => [8 + hour, 9 + hour]);
            }

            const [startTime, endTime] = getRandomTimeSlot(day);
            const teacher = teachers[Math.floor(Math.random() * teachers.length)];
            const classroom = classrooms[Math.floor(Math.random() * classrooms.length)];
            const duration = classDurations[Math.floor(Math.random() * classDurations.length)];
            const actualEndTime = Math.min(startTime + duration, 18);

            timetable.push({ batch, teacher, classroom, day, startTime, endTime: actualEndTime });

            // Remove used slots
            timeSlots[day] = timeSlots[day].filter(slot => !(slot[0] >= startTime && slot[1] <= actualEndTime));

            totalClassesScheduled++;
        }

        if (totalClassesScheduled >= classesPerBatch) {
            return false; // Break the loop
        }
    });
});

// Create DataFrame-like object
const createTableData = () => {
    const df = timetable.sort((a, b) => (a.batch.localeCompare(b.batch) || a.day.localeCompare(b.day) || a.startTime - b.startTime));
    const result = [];

    df.forEach(row => {
        result.push(row);
        result.push({ batch: '', teacher: '', classroom: '', day: '', startTime: '', endTime: '' }); // blank row
    });

    return result;
};

const df = createTableData();

const listEmptySlots = (day, time) => {
    const occupiedClassrooms = df
        .filter(row => row.day === day && row.startTime <= time && row.endTime > time)
        .map(row => row.classroom);

    console.log('Occupied Classrooms:', occupiedClassrooms);
    return classrooms.filter(classroom => !occupiedClassrooms.includes(classroom));
};

const listOngoingClasses = (day, time) => {
    const ongoing = df.filter(row => row.day === day && row.startTime <= time && row.endTime > time);
    console.log('Ongoing Classes:', ongoing);
    return ongoing;
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { timetable: df });
});

app.get('/batch', (req, res) => {
    const batchNumber = req.query.batch_number;
    
    if (batchNumber) {
        const batchTimetable = df.filter(row => row.batch === batchNumber);
        
        if (batchTimetable.length === 0) {
            return res.status(404).send(`No timetable found for batch ${batchNumber}`);
        } else {
            return res.render('timetable', { timetable: batchTimetable });
        }
    } else {
        return res.redirect('/');
    }
});

app.get('/teacher', (req, res) => {
    const teacherId = req.query.teacher_id;
    
    if (teacherId) {
        const teacherTimetable = df.filter(row => row.teacher === teacherId);
        
        if (teacherTimetable.length === 0) {
            return res.status(404).send(`No classes found for teacher ${teacherId}`);
        } else {
            return res.render('timetable', { timetable: teacherTimetable });
        }
    } else {
        return res.redirect('/');
    }
});

app.get('/check_slots', (req, res) => {
    const day = req.query.day;
    const time = parseInt(req.query.time, 10);
    
    if (!day || isNaN(time)) {
        return res.status(400).send('Invalid query parameters');
    }
    
    const emptyClassrooms = listEmptySlots(day, time);
    const ongoingClasses = listOngoingClasses(day, time);
    
    res.render('check_slots', {
        day,
        time,
        emptyClassrooms,
        ongoingClasses
    });
});

app.get('/combined', (req, res) => {
    const batchNumber = req.query.batch_number;
    const teacherId = req.query.teacher_id;

    if (batchNumber && teacherId) {
        const combinedTimetable = df.filter(row => row.batch === batchNumber && row.teacher === teacherId);

        if (combinedTimetable.length === 0) {
            return res.status(404).send(`No timetable found for batch ${batchNumber} and teacher ${teacherId}`);
        } else {
            return res.render('timetable', { timetable: combinedTimetable });
        }
    } else {
        return res.status(400).send('Invalid query parameters');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
