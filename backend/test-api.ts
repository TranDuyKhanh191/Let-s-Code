import jwt from 'jsonwebtoken';

async function run() {
  const token = jwt.sign({ id: 18, role: 'student' }, process.env.JWT_SECRET || 'secret');
  
  try {
    const res = await fetch('http://localhost:3000/api/lessons/student/1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Success! Data:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

run();
