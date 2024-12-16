select * from population.user 
	left join city on user.cityId = city.id 
    left join job on user.jobId = job.id 
where 
	city.name = 'Abilene'
order by firstName
limit 20;

select * from population.user 
	left join city on user.cityId = city.id 
    left join job on user.jobId = job.id 
where 
	city.name = 'Vancouver'
order by firstName
limit 20;

select * from population.user 
	left join city on user.cityId = city.id 
    left join job on user.jobId = job.id 
where 
	city.name = 'Cambridge'
order by firstName
limit 20;

select * from population.user 
	left join city on user.cityId = city.id 
    left join job on user.jobId = job.id 
where 
	city.name = 'Urbandale'
order by firstName
limit 20;

select * from population.user 
	left join city on user.cityId = city.id 
    left join job on user.jobId = job.id 
where 
	city.name = 'Battle Creek'
order by firstName
limit 20;