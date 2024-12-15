const { faker } =  require("@faker-js/faker");
const  mysql = require("mysql2/promise");
const {randomUUID} = require('crypto');
const fs = require('fs/promises');

const usersCount = 1000_000_000;
const citiesCount = 2000_000;
const jobsCount = 1000_000;
const bucketSize = 10000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'population',
    password: '123456',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
})

pool.getConnection()
.then(async (connection)=>{
    await generateFakeCities(connection);
    await generateFakeJobs(connection);
    await generateFakeUsers(connection);

    connection.end()
    .then((response)=>{ 
        console.log("Connection closed"); 
    })
});

const citiesToBeReferenced = [];
const jobsToBeReferenced = [];

/**
 * 
 * @param {import("mysql2").Connection} connection 
 */
async function generateFakeCities(connection) {

    await connection.query(`CREATE TABLE if not exists city(
                id VARCHAR(40) NOT NULL,
                name VARCHAR(100) NOT NULL,
                PRIMARY KEY (id),
                INDEX name_index USING BTREE (name) VISIBLE
            );` 
    );

    const rounds = citiesCount / bucketSize;
    const statsTxt = await fs.open('citiesStats.txt', "w");
    
    const uuids = generateSequentialUUIDs(citiesCount);

    for(let i=0; i<rounds; i++) {
        let cities = [];

        for(let j=0; j<bucketSize; j++) {
            const city = {
                id: uuids[i*bucketSize+j],
                name: faker.location.city()
            }
            cities.push([city.id, city.name]);
        }

        citiesToBeReferenced.push(cities[0][0]);
        citiesToBeReferenced.push(cities[cities.length -1 ][0]);
        citiesToBeReferenced.push(cities[cities.length / 2][0]);

        const t1 = Date.now();
        console.log(`inserting round ${i + 1} )`);

        try {
            await connection.query('insert into city (id, name) values ?', [cities])
        
            const t2 = Date.now();
            
            await statsTxt.write(`bulk # ${i + 1} took ${ ((t2 - t1) / 1000 / 60).toFixed(0) }:${((t2 - t1) / 1000 % 60).toFixed(0)}, \n`);

            console.log("success");   
        } catch (error) {
            console.log(error);
        }
    }

    await statsTxt.close()

}


async function generateFakeJobs(connection) {
    
    await connection.query(`CREATE TABLE if not exists job(
                id VARCHAR(40) NOT NULL,
                name VARCHAR(100) NOT NULL,
                note VARCHAR(100) NOT NULL,
                PRIMARY KEY (id),
                INDEX name_index USING BTREE (name) VISIBLE
            );` 
    );

    const rounds = jobsCount / bucketSize;
    const statsTxt = await fs.open('jobsStats.txt', "w");

    const uuids = generateSequentialUUIDs(jobsCount);

    for(let i=0; i<rounds; i++) {
        let jobs = [];

        for(let j=0; j<bucketSize; j++) {
            const job = {
                id: uuids[i*bucketSize+j],
                name: faker.person.jobTitle(),
                note: faker.person.jobDescriptor(),
            }
            jobs.push([job.id, job.name, job.note]);
            
        }

        jobsToBeReferenced.push(jobs[0][0]);
        jobsToBeReferenced.push(jobs[jobs.length -1 ][0]);
        jobsToBeReferenced.push(jobs[jobs.length / 2][0]);

        const t1 = Date.now();
        console.log(`inserting round ${i + 1} )`);

        try {
            await connection.query('insert into job (id, name, note) values ?', [jobs])
        
            const t2 = Date.now();
            
            await statsTxt.write(`bulk # ${i + 1} took ${ ((t2 - t1) / 1000 / 60).toFixed(0) }:${((t2 - t1) / 1000 % 60).toFixed(0)}, \n`);

            console.log("success");   
        } catch (error) {
            console.log(error);
        }
    }

    await statsTxt.close()
}


async function generateFakeUsers(connection) {

    await connection.query(`CREATE TABLE if not exists user(
            id VARCHAR(40) NOT NULL,
            firstName VARCHAR(100) NOT NULL,
            lastName VARCHAR(100) NOT NULL,
            bio TEXT NOT NULL,
            gender tinyint(1) NOT NULL,
            birthDate DATE NOT NULL,
            jobId VARCHAR(40) NOT NULL,
            cityId VARCHAR(40) NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (jobId) REFERENCES job(id),
            FOREIGN KEY (cityId) REFERENCES city(id),
            INDEX firstName_index USING BTREE (firstName) VISIBLE, 
            INDEX lastname_index USING BTREE (lastName) VISIBLE,
            INDEX gender_index USING BTREE (gender) VISIBLE
        );` 
    );

    const rounds = usersCount / bucketSize;
    const statsTxt = await fs.open('usersStats.txt', "w");

    const uuids = generateSequentialUUIDs(usersCount);

    for(let i=0; i<rounds; i++) {

        let users = [];

        for(let j=0; j<bucketSize; j++) {
            let gender = faker.person.sex();

            const user = {
                id: uuids[i*bucketSize+j],
                
                firstName: faker.person.firstName(gender),
                lastName: faker.person.lastName("male"),
                bio: faker.person.bio(),
                gender: gender == "male" ? 0: 1,
                birthDate: faker.date.anytime(),
                jobId: jobsToBeReferenced [ 
                    faker.number.int({min: 0, max: jobsToBeReferenced.length-1})
                ],
                cityId: citiesToBeReferenced [
                    faker.number.int({min: 0, max: citiesToBeReferenced.length-1})
                ],

            }
            users.push([user.id, user.firstName, user.lastName, user.bio, user.gender, user.birthDate, user.jobId, user.cityId]);
        }

        const t1 = Date.now();
        console.log(`inserting round ${i + 1} )`);

        try {
            await connection.query('insert into user (id, firstName, lastName, bio, gender, birthDate, jobId, cityId ) values ?', [users])
        
            const t2 = Date.now();
            
            await statsTxt.write(`bulk # ${i + 1} took ${ ((t2 - t1) / 1000 / 60).toFixed(0) }:${((t2 - t1) / 1000 % 60).toFixed(0)}, \n`);

            console.log("success");   
        } catch (error) {
            console.log(error);
        }
    }

    await statsTxt.close()

}


function generateSequentialUUIDs(count){

    let uuids = [];

    for(let i=0; i<count; i++){
        uuids.push(randomUUID());
    }

    uuids.sort();
    return uuids;
}
