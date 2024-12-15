# Introduction
this experiment shows what you actually expect when working with 1 billion record database, it tests and compares the performance of queries on a single table of 1 billion records against another partitioned table of 1 billion records.



# intial schema
this is the schema that we will start with.

![initial schema](./images/initial-schema.png)

the plan is to populate the tables before testing to contain these number of rows:
- user table: 1 billion records
- city table: 2 million records
- job table: 1 million records

# problems that may arise
    - space issue 
        - move data partition 
        - disable binlog during insertion

# building a 1 billion record table 

* this section walks us through populating the database in different situations.
* within each trial we do a little change and watch its effect on insertion performance.
* each trial is associated with a **js** file that automates the inserion operation (scripts folder).

1. **building the table with random UUID, add indexes before insertion**
    
    - this approach uses the intial schema  
    - this test is done by running **[fakedbInitial.js](./scripts/fakeDbInitial.js)** 
    - the test is done at **128 MB** *[innodb_buffer_pool_size](https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_buffer_pool_size)*.
    - the script creates the schema for each table and the associated indexes first before insertion.
    - the script creates a random UUID for each record
    - insertion occurs in chunks where each chunk is 10K rows.
    - this table shows time consumed to insert each bulk into city table
   
        | bulk No. | Time (MM:SS) |
        |:---------:|:------------:|
        |     1     |     0:03     |
        |     2     |     0:03     |
        |     3     |     0:02     |
        |     4     |     0:03     |
        |     5     |     0:04     |
        |     6     |     0:05     |
        |     7     |     0:05     |
        |     8     |     0:11     |
        |     9     |     0:20     |
        |    10     |     1:31     |
        |    11     |     1:42     |
        |    12     |     1:53     |
        |    13     |     1:02     |
        |    14     |     1:11     |
        |    15     |     1:18     |
        |    16     |     1:26     |
        |    17     |     2:35     |
        |    18     |     2:48     |
        |    19     |     2:54     |
        |    20     |     2:05     |


        this is the time taken to insert **2 million** rows in the city table, it took about **21 mins**, which is very slow if want to apply the same approach to the users table


2. repeat the previous step with **0.5 GB** *[innodb_buffer_pool_size](https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_buffer_pool_size)* 
    
    - open a Mysql session through terminal / any DB management tool 
        - run this command:<br/>
        ```sql
        SET GLOBAL innodb_buffer_pool_size = 536870912;
        ```

    - rerun the same script again **[fakedbInitial.js](./scripts/fakeDbInitial.js)** 
    - time tracked for insertion operations into the city table

        | Bulk No. | Time (MM:SS) |
        |:--------:|:------------:|
        |     1    |     0:03     |
        |     2    |     0:03     |
        |     3    |     0:03     |
        |     4    |     0:02     |
        |     5    |     0:03     |
        |     6    |     0:06     |
        |     7    |     0:03     |
        |     8    |     0:04     |
        |     9    |     0:05     |
        |    10    |     0:07     |
        |    11    |     0:06     |
        |    12    |     0:06     |
        |    13    |     0:07     |
        |    14    |     0:08     |
        |    15    |     0:07     |
        |    16    |     0:08     |
        |    17    |     0:08     |
        |    18    |     0:09     |
        |    19    |     0:10     |
        |    20    |     0:09     |

        - you can see that increasing the buffer pool size has its effect on the time consumed for bulks inserted after the table got large (e.g. bulks 18, 19, 20).

    
    - checking the time consumed by inserting into "user" table

        | Bulk No. | Time (MM:SS) |
        |:--------:|:------------:|
        |     1    |     0:21     |
        |     2    |     0:13     |
        |     3    |     0:16     |
        |     4    |     0:23     |
        |     5    |     0:27     |
        |     6    |     1:31     |
        |    ...   |      ...     |
        |    23    |     4:08     |
        |    24    |     4:19     |
        |    25    |     5:47     |
        |    26    |     5:55     |
        |    27    |     5:41     |
        |    ...   |      ...     |
        |    48    |    10:39     |
        |    49    |    10:37     |
        |    50    |    10:45     |
        |    51    |    10:49     |
        |    52    |    11:32     |
        |    53    |    10:07     |
        |    ...   |      ...     |
        |    95    |    12:25     |
        |    96    |    12:22     |
        |    97    |    13:14     |
        |    98    |    13:34     |
        |    99    |    13:38     |
        |   100    |    13:17     |

        - it takes so long at bulk No. 100, so we decided not to complete the insertion opertation ( **99,900** bulks were remaining to complete 1 billion records )


3. repeat the insertion process with auto increment ID instead of UUID
    
    - use **[fakeDbAutoInc.js](./scripts/fakeDbAutoInc.js)**.
        - this file is just a modification over the previous one **[fakedbInitial.js](./scripts/fakeDbInitial.js)** where we replace random UUIDs with sequential integers.
    
    - checking time durations of insertion into "user" table again for the first 5000 bulks

        | Bulk No. | Time (MM:SS) |
        |:--------:|:------------:|
        |     1    |     0:02     |
        |     2    |     0:01     |
        |     3    |     0:00     |
        |     4    |     0:01     |
        |     5    |     0:01     |
        |     6    |     0:01     |
        |     7    |     0:00     |
        |     8    |     0:01     |
        |     9    |     0:01     |
        |   ...    |      ...     |
        |   4988   |     0:00     |
        |   4989   |     0:01     |
        |   4990   |     0:00     |
        |   4991   |     0:01     |
        |   4992   |     0:01     |
        |   4993   |     0:02     |
        |   4994   |     0:00     |
        |   4995   |     0:01     |
        |   4996   |     0:00     |
        |   4997   |     0:01     |
        |   4998   |     0:00     |
        |   4999   |     0:01     |
        |   5000   |     0:01     |

    - notice the significant decrease in the insertion time just because of replacing random UUID with sequential integers
    
    - **this result shows us that**:
        1. reodering secondary indexes while insertion is more cheaper than reodering primary index.
        
        2. a non sequential primary key reduces  bulk insertion performance.

4. repeat the insertion process with sequential UUID instead of Auto inc.

    - this test will show us the key factor behind the insertion performance degradation, whether it's caused by the randomness of the **PK** or by the data type(fixed varchar / integer) of the **PK**.

    - use the script **[fakeDbSeqUUID.js](./scripts/fakeDbSeqUUID.js)**
    
    - we checked then the time consumed by each bulk till bulk No.5000 for the "user" table

        | Bulk No. | Time (MM:SS) |
        |:--------:|:------------:|
        |     1    |     0:01     |
        |     2    |     0:00     |
        |     3    |     0:00     |
        |     4    |     0:00     |
        |     5    |     0:01     |
        |     6    |     0:01     |
        |     7    |     0:01     |
        |     8    |     0:01     |
        |     9    |     0:00     |
        |    10    |     0:01     |
        |    11    |     0:01     |
        |    12    |     0:01     |
        |    13    |     0:00     |
        |   ...    |      ...     |
        |   4982   |     0:03     |
        |   4983   |     0:03     |
        |   4984   |     0:04     |
        |   4985   |     0:03     |
        |   4986   |     0:03     |
        |   4987   |     0:03     |
        |   4988   |     0:03     |
        |   4989   |     0:03     |
        |   4990   |     0:03     |
        |   4991   |     0:03     |
        |   4992   |     0:03     |
        |   4993   |     0:03     |
        |   4994   |     0:04     |
        |   4995   |     0:03     |
        |   4996   |     0:03     |
        |   4997   |     0:03     |
        |   4998   |     0:03     |
        |   4999   |     0:05     |
        |   5000   |     0:02     |

    - by comparing against the results from the previous test, we are sure now that the key factor behind perfomance degradation was the randomness of the UUID not the UUID itself, however you can see that sequential integers are better. 


5. revert back to AutoInc ID and delay index creation till insertion complete

    - use **[fakeDbBillion.js](./scripts/fakeDbBillion.js)**
        - this script uses the AutoInc scheme
        - it also delays index creation operations till all bulks are inserted.

    - this method yeilds the best insertion performance, as:
        - all records are ordered by nature because of sequential key
        - there are no indexes to worry about while insertion. 
    
    - results:
        - 100,000,000 records took about 22 mins.
        - populating the table with 900_000_000 records took about 3hrs 20 mins.
        - building index for firstName col when the table has 100_000_000 records took 6.5 mins
        - building index for firstname col when the table has 200_000_000 records took 13.25 mins
        - building index for firstname col when the table has 700_000_000 records took 38.3 mins
        - building index for firstName col when the table has 900_000_000 records took 58 mins 

# schema after updates

![schema after upadtes](./images/schema-after-updates.png)
- changed id cols to integer Auto inc. instead of varchar
- added public ID column (*just an additional col. to increase row width*)

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
