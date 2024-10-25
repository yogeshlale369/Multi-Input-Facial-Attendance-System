import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { parse } from 'csv-parse/sync';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6666', '#82ca9d'];

const AttendanceDashboard = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [classroomStats, setClassroomStats] = useState([]);

  useEffect(() => {
    fetch('attendance.csv')
      .then(response => response.text())
      .then(csvString => {
        const parsedData = parse(csvString, {
          columns: true,
          skip_empty_lines: true
        });
        setData(parsedData);
        setFilteredData(parsedData);
      })
      .catch(error => console.error("Error fetching and parsing CSV file:", error));
      
  }, []);

  useEffect(() => {
    const divisionStats = filteredData.reduce((acc, curr) => {
      acc[curr.Division] = (acc[curr.Division] || 0) + 1;
      return acc;
    }, {});
    setAttendanceStats(Object.entries(divisionStats).map(([name, value]) => ({ name, value })));

    const classStats = filteredData.reduce((acc, curr) => {
      acc[curr.classroom] = (acc[curr.classroom] || 0) + 1;
      return acc;
    }, {});
    setClassroomStats(Object.entries(classStats).map(([name, value]) => ({ name, value })));
  }, [filteredData]);

  const handleSearch = () => {
    const filtered = data.filter(item => 
      Object.values(item).some(val => 
        val.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-indigo-700">Attendance Dashboard</h1>
        
        <div className="mb-8 flex justify-center">
          <input 
            type="text" 
            placeholder="Search by any field..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-indigo-400 rounded-l-lg px-4 py-3 w-96 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button 
            onClick={handleSearch} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-r-lg hover:bg-indigo-700 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Attendance by Division</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-700">Classroom Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classroomStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {classroomStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Attendance Records</h2>
            <p className="text-gray-700 mb-6 text-lg">Total Records: {filteredData.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-light">
              <thead className="bg-indigo-600 text-white text-lg">
                <tr>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">PRN</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Division</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Classroom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="px-6 py-4">{item.Rollno}</td>
                    <td className="px-6 py-4">{item.PRN}</td>
                    <td className="px-6 py-4">{`${item.FirstName} ${item.LastName}`}</td>
                    <td className="px-6 py-4">{item.Division}</td>
                    <td className="px-6 py-4">{item.Time}</td>
                    <td className="px-6 py-4">{item.classroom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
