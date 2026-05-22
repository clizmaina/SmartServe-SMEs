// Setup local MySQL database and user for SmartServe SMEs
const mysql = require('mysql2');

const root = mysql.createConnection({ host: 'localhost', user: 'root', password: '', port: 3306 });

root.connect(err => {
    if (err) {
        console.error('❌ Cannot connect to MySQL root:', err.message);
        console.log('Make sure XAMPP MySQL is running.');
        process.exit(1);
    }
    console.log('✅ Connected to MySQL as root');

    const queries = [
        "CREATE DATABASE IF NOT EXISTS smartstitchtech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE USER IF NOT EXISTS 'smartstitsch'@'localhost' IDENTIFIED BY 'smart123456'",
        "GRANT ALL PRIVILEGES ON smartstitchtech.* TO 'smartstitsch'@'localhost'",
        "FLUSH PRIVILEGES"
    ];

    let i = 0;
    function next() {
        if (i >= queries.length) {
            console.log('✅ Database setup complete!');
            console.log('   DB: smartstitchtech');
            console.log('   User: smartstitsch');
            console.log('   Pass: smart123456');
            console.log('\nYou can now run: node server.js');
            root.end();
            return;
        }
        root.query(queries[i], (err) => {
            if (err && !err.message.includes('already exists') && !err.message.includes('Operation CREATE USER')) {
                console.warn('⚠️ Query warning:', queries[i].substring(0, 40), '->', err.message);
            } else {
                console.log('✅', queries[i].substring(0, 50));
            }
            i++;
            next();
        });
    }
    next();
});
