# Introduction
this experiment shows what you actually expect when working with 1 billion record 
database



# intial schema
    [initial schema](./images/initial-schema.png)


# problems that may arise
    - space issue 
        - move data partition 
        - disable binlog during insertion

# building a 1 billion record table 
1- building the table with random UUID + indexes before insertion 
    - fakedb.js 
    - couldn't complete it, it takes so long 
    - use numbers listed first in the file for the 2000,000 records (cities table)

    bulk # 1 took 0:3, 
    bulk # 2 took 0:3, 
    bulk # 3 took 0:2, 
    bulk # 4 took 0:3, 
    bulk # 5 took 0:4, 
    bulk # 6 took 0:5, 
    bulk # 7 took 0:5, 
    bulk # 8 took 0:11, 
    bulk # 9 took 0:20, 
    bulk # 10 took 1:31, 
    bulk # 11 took 1:42, 
    bulk # 12 took 1:53, 
    bulk # 13 took 1:2, 
    bulk # 14 took 1:11, 
    bulk # 15 took 1:18, 
    bulk # 16 took 1:26, 
    bulk # 17 took 2:35, 
    bulk # 18 took 2:48, 
    bulk # 19 took 2:54, 
    bulk # 20 took 2:5


2- repeat the previous step with 0.5GB buffer 
    - display the new numbers from the second bulk
    - number from cities table 
        bulk # 1 took 0:3, 
        bulk # 2 took 0:3, 
        bulk # 3 took 0:3, 
        bulk # 4 took 0:2, 
        bulk # 5 took 0:3, 
        bulk # 6 took 0:6, 
        bulk # 7 took 0:3, 
        bulk # 8 took 0:4, 
        bulk # 9 took 0:5, 
        bulk # 10 took 0:7, 
        bulk # 11 took 0:6, 
        bulk # 12 took 0:6, 
        bulk # 13 took 0:7, 
        bulk # 14 took 0:8, 
        bulk # 15 took 0:7, 
        bulk # 16 took 0:8, 
        bulk # 17 took 0:8, 
        bulk # 18 took 0:9, 
        bulk # 19 took 0:10, 
        bulk # 20 took 0:9, 
    
    - show numbers from the users table also
        bulk # 1 took 0:21, 
        bulk # 2 took 0:13, 
        bulk # 3 took 0:16, 
        bulk # 4 took 0:23, 
        bulk # 5 took 0:27, 
        bulk # 6 took 1:31, 
                :
        bulk # 23 took 4:8, 
        bulk # 24 took 4:19, 
        bulk # 25 took 5:47, 
        bulk # 26 took 5:55, 
        bulk # 27 took 5:41, 
                :
        bulk # 48 took 10:39, 
        bulk # 49 took 10:37, 
        bulk # 50 took 10:45, 
        bulk # 51 took 10:49, 
        bulk # 52 took 11:32, 
        bulk # 53 took 10:7, 
                : 
        bulk # 95 took 12:25, 
        bulk # 96 took 12:22, 
        bulk # 97 took 13:14, 
        bulk # 98 took 13:34, 
        bulk # 99 took 13:38, 
        bulk # 100 took 13:17, 


3- repeat the insertion process with auto increment ID instead of UUID
    - by modifying DbBillion.js to replace UUID with autoInc and keep all other indexes 
    - display the numbers from the 3rd bulk

    bulk # 1 took 0:2, 
    bulk # 2 took 0:1, 
    bulk # 3 took 0:0, 
    bulk # 4 took 0:1, 
    bulk # 5 took 0:1, 
    bulk # 6 took 0:1, 
    bulk # 7 took 0:0, 
    bulk # 8 took 0:1, 
    bulk # 9 took 0:1,

    bulk # 4988 took 0:0, 
    bulk # 4989 took 0:1, 
    bulk # 4990 took 0:0, 
    bulk # 4991 took 0:1, 
    bulk # 4992 took 0:1, 
    bulk # 4993 took 0:2, 
    bulk # 4994 took 0:0, 
    bulk # 4995 took 0:1, 
    bulk # 4996 took 0:0, 
    bulk # 4997 took 0:1, 
    bulk # 4998 took 0:0, 
    bulk # 4999 took 0:1, 
    bulk # 5000 took 0:1, 

    reodering secondary indexes while insertion 
    is more cheaper than reodering primary index

    a non sequential primary key reduces  bulk insertion performance, bulk insert time became constant almost 1 sec after converting primary key to a sequential integer  


4- repeat the insertion process with sequential UUID
 instead of Auto inc.

    bulk # 1 took 0:1, 
    bulk # 2 took 0:0, 
    bulk # 3 took 0:0, 
    bulk # 4 took 0:0, 
    bulk # 5 took 0:1, 
    bulk # 6 took 0:1, 
    bulk # 7 took 0:1, 
    bulk # 8 took 0:1, 
    bulk # 9 took 0:0, 
    bulk # 10 took 0:1, 
    bulk # 11 took 0:1, 
    bulk # 12 took 0:1, 
    bulk # 13 took 0:0, 
            :
            :
            :
    bulk # 4982 took 0:3, 
    bulk # 4983 took 0:3, 
    bulk # 4984 took 0:4, 
    bulk # 4985 took 0:3, 
    bulk # 4986 took 0:3, 
    bulk # 4987 took 0:3, 
    bulk # 4988 took 0:3, 
    bulk # 4989 took 0:3, 
    bulk # 4990 took 0:3, 
    bulk # 4991 took 0:3, 
    bulk # 4992 took 0:3, 
    bulk # 4993 took 0:3, 
    bulk # 4994 took 0:4, 
    bulk # 4995 took 0:3, 
    bulk # 4996 took 0:3, 
    bulk # 4997 took 0:3, 
    bulk # 4998 took 0:3, 
    bulk # 4999 took 0:5, 
    bulk # 5000 took 0:2, 

you can notice that performance is better when you have an AI int as PK

5- revert back to AUtoINc ID and delay index creation till insertion complete
(fakeDbBillion.js)

    100,000,000 records took about 22 mins (stoppes the script)

    populating the table with 900_000_000 records took about 3hrs 20 mins.

    building index for firstName col at 100_000_000 took 6.5 mins

    building index for firstname col at 200_000_000 took 13.25 mins

    building index for firstname col at 700_000_000 took 38.3 mins

    building index for firstName col at 900_000_000 took 58 mins 

# schema after updates
    [schema after upadtes](./images/schema-after-updates.png)
    - changing id cols to int instead ov varchar
    - adding public ID column

# building a partitioned table
    
    we decided to add a new user table to the schema in the partitioned form so
    we can compare the performance of operationg queries on both to see if we can benefit
    from partitioning in case of having large number of rows

    both tables (user, user_partitioned) have the same data distribution

    you can choose the best partition key according to your case or your need, here 
    it seems real and rational to partition users just by the city the live in, this is just as example but you are free to do what you want (partition by birth year / job / ...) according to your case.

    [schema after adding partitioned table](./images/schema-after-adding-user-partitioned.png)

    partition key is (cityId)
    table primary key is (id, cityId) this is because Mysql adds a restriction
    that "the partition key must be a member of every unique key in the table"


# data distribution inside tables

    - city and job tables have duplicates, so you can find multiple cities have the same name and multiple jobs have the same name.

    for the partitioned table:
        - it's clear that users are partitioned by cityID
        - since cities have duplicated names, then you should expect to find users in partion "A" with city name "london" ,and expect to find users in partition "K" with city name "london" however, the first "london" city has different ID from the second "london" city (2 different cities with same name).

        - the duplication is because of the limited random values provided by the faker package.
    
    - we decided to pick some cities and tweak their names to make them unique throughout the whole table to see the effect of operationg on unique values.


# define the test method
    - bash script
    - hardware used
    - mysql version
    - linux 
    - for each test check the corresponding folder to see the queries used and the detailed results.

# test1 (test O)    
**filter users by non unique city name**<br/>
- this test shows the performance when running a auery that filters the large table by a field in a second joined table 

- the test uses 20 queries per file


**queries involved:**
* single table:
    ```sql
    select * from population.user 
        left join city on user.cityId = city.id 
        left join job on user.jobId = job.id 
    where 
        city.name = 'Aaliyahberg' 
    limit 20;
    ```
* partitioned table:
    ```sql
    select * from population.user_partitioned 
        left join city on user_partitioned.cityId = city.id 
        left join job on user_partitioned.jobId = job.id 
    where 
        city.name = 'Aaliyahberg' 
    limit 20;
    ```
    
<!-- 128MB buffer

| concurrency | avg Mem | avg cpu | time (sec) | avg Mem | avg cpu | time (sec) | 
|-------------|:-------:|:-------:|:----:      |:-------:|:-------:|:----:      |
| 50          | 4.30 %  | 47.77 % | 0.092      | 4.30 %  | 62.64 % |0.140       | 
| 100         | 4.30 %  | 61.39 % | 0.168      | 4.30 %  | 73.82 % |0.296       |
| 200         | 4.32 %  | 71.89 % | 0.314      | 4.43 %  | 77.35 % |0.624       |
| 400         | 5.23 %  | 83.92 % | 0.753      | 5.94 %  | 85.34 % |0.848       | -->

test at at 128MB *[innodb_buffer_pool_size](https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_buffer_pool_size)*:
<table border="1" style="border-collapse: collapse; text-align: center;">
  <tr>
    <th rowspan="2">Concurrency</th>
    <th colspan="3">Single Table</th>
    <th colspan="3">Partitioned Table</th>
  </tr>
  <tr>
    <th>Avg Mem</th>
    <th>Avg CPU</th>
    <th>Time (sec)</th>
    <th>Avg Mem</th>
    <th>Avg CPU</th>
    <th>Time (sec)</th>
  </tr>
  <tr>
    <td>50</td>
    <td>4.30%</td>
    <td>47.77%</td>
    <td>0.092</td>
    <td>4.30%</td>
    <td>62.64%</td>
    <td>0.140</td>
  </tr>
  <tr>
    <td>100</td>
    <td>4.30%</td>
    <td>61.39%</td>
    <td>0.168</td>
    <td>4.30%</td>
    <td>73.82%</td>
    <td>0.296</td>
  </tr>
  <tr>
    <td>200</td>
    <td>4.32%</td>
    <td>71.89%</td>
    <td>0.314</td>
    <td>4.43%</td>
    <td>77.35%</td>
    <td>0.624</td>
  </tr>
  <tr>
    <td>400</td>
    <td>5.23%</td>
    <td>83.92%</td>
    <td>0.753</td>
    <td>5.94%</td>
    <td>85.34%</td>
    <td>0.848</td>
  </tr>
</table>

by comparing time elapsed during the test, we can see that:
    - a single table is better in case we just need filtering.
        - the reason is because the table partitions each has it's own index, so
        the engine will need to search separately throughout each index and collect 
        the results from each and this involves read of non adjacent index pages from the disk, while on the opposite side, the optimizer needs to search only once and fetch all the needed pages of the index at once.

    - performance is acceptable when filtering through an index of a large table

checking the plans for each

* single table<br/> 
    ![single table plan](./tests/test%20O/images/visual-plan.png)

* partitioned table<br/> 
    ![partitioned table plan](./tests/test%20O/images/visual-plan-partitioned.png)

 they show similar plans, where the optimizer:
 1. uses the name_index to find the atual rows from the city table that satisfies the 
 where clause.
 
 2. after reading the rows from city table, it uses the cityId field to initiate a search into the cityId index of the users table, then it reads the actual rows satisfying the join condition (cityId = user.cityId), then rows from the users table are joined to the rows fetched from city table.

 3. it then uses the jobId field from the rows from the users table to issue a search into 
 the job primary index.
