#!/bin/bash

#get number of CPUs
read -r -a arr <<< "$(lscpu | grep CPU\(s\))";
cpuCount=${arr[1]}

# start profiling
echo "start profiling cpu and memory";
top -b -d 0.1 | grep --line-buffered  mysqld > tmpfile.txt &
topPID=$!;


#run benchmark
echo "running benchmark";


mysqlslap \
--user root  \
--password=123456 \
--host=localhost \
--iterations=3 \
--concurrency=3 \
--create-schema=population \
--verbose \
--delimiter=\; \
--query=./tests/test\ O\'\'/single-table.sql  >  load-test-results.txt; 

sleep 0.25;

#stop profiling
kill $topPID;



#process results
echo "#Step Cpu Mem" > load-test-profile.txt;

samples=0;

minMem=1000000;
maxMem=0;
accMem=0;

minCpu=1000000;
maxCpu=0;
accCpu=0;



while read -r line; do
        # Use echo to feed the line into read, replacing <<< "$line"
        IFS=' ' read -r -a vals <<< "$line"
        

        cpuPercent=$(echo "scale=2;  ${vals[8]} /  $cpuCount " | bc);
        if [ $(echo "$cpuPercent < $minCpu" | bc -l) -eq 1 ]
        then
            minCpu=$cpuPercent;
        fi 

        if [ $(echo "$cpuPercent > $maxCpu" | bc -l ) -eq 1 ]
        then
            maxCpu=$cpuPercent;
        fi 
        
        
        memPercent=${vals[9]};
        if [ $(echo "$memPercent < $minMem" | bc -l ) -eq 1 ]
        then
            minMem=$memPercent;
        fi 

        if [ $(echo "$memPercent > $maxMem" | bc -l ) -eq 1 ]
        then
            maxMem=$memPercent;
        fi

        accCpu=$(echo "scale=2; $accCpu + $cpuPercent" | bc);
        accMem=$(echo "scale=2; $accMem + $memPercent" | bc);


        # push data to profile 
        echo "${samples} ${cpuPercent} ${memPercent}" >> load-test-profile.txt

        samples=$(( 1 + $samples ));
done < tmpfile.txt


# clean up
rm tmpfile.txt;


#adding memory and CPU to load-test results

echo >> load-test-results.txt;
echo "samples = ${samples}" >> load-test-results.txt;
echo >> load-test-results.txt;

echo "avgMem = $(echo "scale=2; $accMem / $samples " | bc) %" >> load-test-results.txt;
echo "maxMem = ${maxMem}" >> load-test-results.txt;
echo "minMem = ${minMem}" >> load-test-results.txt;

echo >> load-test-results.txt;

echo "avgCpu = $(echo "scale=2; $accCpu / $samples " | bc) %" >> load-test-results.txt;
echo "minCpu = ${minCpu}" >> load-test-results.txt;
echo "maxCpu = ${maxCpu}" >> load-test-results.txt;



echo "finished";




#calculate stats
#filename="load-test-profile.txt";
#totalCpu=0;
#totalMem=0;
#iterations=0;

# Read the file line by line
#while IFS= read -r line
#do
#    read -r -a vals <<< "$line";
 #   totalCpu=$(echo "scale=2; $totalCpu + ${vals[8]}" | bc);
 #   totalMem=$(echo "scale=2; $totalMem + ${vals[9]}" | bc);
 #   iterations=$(( 1 + $iterations ));

#done < "$filename"

#read -r -a cpuCount <<< "$(lscpu | grep CPU\(s\))";
#echo "${cpuCount[1]}"

#echo "avg cpu = $(echo "scale=2; (( $totalCpu / $iterations ) / ( ${cpuCount[1]} * 100 ) * 100)" | bc) %" ;
#echo "avg mem = $(echo "scale=2; $totalMem / $iterations" | bc) %";

