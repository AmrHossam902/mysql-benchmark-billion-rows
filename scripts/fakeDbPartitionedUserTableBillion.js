const { faker } =  require("@faker-js/faker");
const  mysql = require("mysql2/promise");
const {randomUUID} = require('crypto');
const fs = require('fs/promises');

const usersCount = 950_000_000;
const citiesCount = 2_000_000;
const jobsCount = 1000_000;
const bucketSize = 10000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'population',
    password: '123456',
    waitForConnections: true,
    connectionLimit: 1,
    maxIdle: 1, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
})

pool.getConnection()
.then(async (connection)=>{
    await connection.query(`SET sql_log_bin=OFF;`);
    await generateFakeUsers(connection);

    connection.end()
    .then((response)=>{ 
        console.log("Connection closed"); 
    })
});



async function generateFakeUsers(connection) {

    await connection.query(`set global foreign_key_checks=0;`);

    let qs = `CREATE TABLE if not exists user_partitioned(
            id int auto_increment,
            publicId VARCHAR(40) NOT NULL,
            firstName VARCHAR(100) NOT NULL,
            lastName VARCHAR(100) NOT NULL,
            bio TEXT NOT NULL,
            gender tinyint(1) NOT NULL,
            birthDate DATE NOT NULL,
            jobId int NOT NULL,
            cityId int NOT NULL,
            PRIMARY KEY (id, cityId)
        )
        partition by range(cityId) (`;
    // can't define primary key (cityId, id) because there can be one auto Inc and it has to be a key
    // you can remove primary key but this is a big risk as you can't gurantee to find rows esactly later
    for (let i = 0; i < 199; i++) {
        
        qs +=`PARTITION p${i} VALUES LESS THAN (${ (i+1) * 10_000}),`;
    }

    qs += `PARTITION p199 VALUES LESS THAN (MAXVALUE) );`;


    await connection.query(qs);

    const rounds = usersCount / bucketSize;
    const statsTxt = await fs.open('usersStats.txt', "w");


    for(let i=0; i<rounds; i++) {

        let users = [];

        for(let j=0; j<bucketSize; j++) {
            let gender = faker.person.sex();

            const user = {
                publicId: randomUUID(),
                firstName: faker.person.firstName(gender),
                lastName: faker.person.lastName("male"),
                bio: faker.person.bio(),
                gender: gender == "male" ? 0: 1,
                birthDate: faker.date.anytime(),
                jobId: faker.number.int({min: 1, max: jobsCount}),
                cityId: faker.number.int({min: 1, max: citiesCount})
            }
            users.push([user.publicId, user.firstName, user.lastName, user.bio, user.gender, user.birthDate, user.jobId, user.cityId]);
        }

        const t1 = Date.now();
        console.log(`inserting round ${i + 1} )`);

        try {
            await connection.query('insert into user_partitioned (publicId, firstName, lastName, bio, gender, birthDate, jobId, cityId ) values ?', [users])
        
            const t2 = Date.now();
            
            await statsTxt.write(`bulk # ${i + 1} took ${ ((t2 - t1) / 1000 / 60).toFixed(0) }:${((t2 - t1) / 1000 % 60).toFixed(0)}, \n`);

            console.log("success");   
        } catch (error) {
            console.log(error);
        }
    }

    console.log( "building firstName index" );
    await connection.query(`alter table user_partitioned 
        add INDEX firstName_index USING BTREE (firstName) VISIBLE;`);
    
    console.log( "building gender index" );
    await connection.query(`alter table user_partitioned
        add INDEX gender_index USING BTREE (gender) VISIBLE;`);

    console.log( "building cityId index");
    await connection.query(`alter table user_partitioned
            add INDEX cityId_index USING BTREE (cityId) VISIBLE;`);
    

    await connection.query(`set global foreign_key_checks=1;`);

    await statsTxt.close()

}
