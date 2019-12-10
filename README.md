# Foxhound Security Solution

## db setup:

Export the following paths in your terminal, or in the .bashrc file:

    export FH_DB_NAME='your_db_name'
    export FH_DB_USER='your_db_username' 
    export FH_DB_PASSWORD='your_db_password'
    
    
## Add the __foxhound__ module to your virtualenvironment
* Open the *bin/activate* file.
* Add the following line to the bottom of the file:

        export PYTHONPATH="/home/username/path_to_foxhound_repo/foxhound"




## Spark Setup to your local Computer

### Step 1:  Adding 127.0.0.1 as master in hosts file

```sh
$ sudo vim /etc/hosts
```
in a new line add
```
127.0.0.1 master
```
save the hosts file.


### Step 2: Configure SSH
```
$ sudo apt-get install openssh-server openssh-client
```
Generate key pairs
```
$ ssh-keygen -t rsa -P ""
```
Configure passwordless SSH
replace username with your accountusername
```
$ ssh-copy-id -i ~/.ssh/id_rsa.pub <username>@127.0.0.1
```
Check by SSH to your localhost(master) itself
```
$ ssh master
```
### Step 3: Install Java
```
$ sudo apt update
$ sudo apt install default-jre
$ sudo apt install default-jdk
```
Verify the installation with:
```
$ java -version
$ javac -version
```
### Step 4: Install Spark

Download the stable release of spark with hadoop
```
$ wget https://www-us.apache.org/dist/spark/spark-2.4.4/spark-2.4.4-bin-hadoop2.7.tgz
```
Extract Spark tar
Use the following command for extracting the spark tar file.
```
$ tar xvf spark-2.4.4-bin-hadoop2.7.tgz
```
Move Spark software files
Use the following command to move the spark software files to respective directory (/usr/local/bin)
```
$ sudo mv spark-2.3.0-bin-hadoop2.7 /usr/local/spark
```
Set up the environment for Spark
Edit bashrc file.
```
$ $ sudo vim ~/.bashrc
```
Add the following line to ~/.bashrc file. It means adding the location, where the spark software file are located to the PATH variable. (no spaces before and after = sign)
```
export PATH=$PATH:/usr/local/spark/bin
export SPARK_HOME=/usr/local/spark
```
Use the following command for sourcing the ~/.bashrc file.
```
$ source ~/.bashrc
```

### Step 5: Spark Master Configuration
Do the following procedures 
Edit spark-env.sh
Move to spark conf folder and create a copy of template of spark-env.sh and rename it.
```
$ cd /usr/local/spark/conf
$ cp spark-env.sh.template spark-env.sh
```
Now edit the configuration file spark-env.sh.
```
$ sudo vim spark-env.sh
```
Add following parameters at the top
```
export SPARK_MASTER_HOST='127.0.0.1'
export JAVA_HOME=/usr
```
Edit the configuration file slaves in (/usr/local/spark/conf).
```
$ sudo vim slaves
```
And add the following entries.
```
master
```
Start Spark Cluster
To start the spark cluster, run the following command on master.
```
$ cd /usr/local/spark
$ ./sbin/start-all.sh
```
To stop the spark cluster, run the following command on master.
```
$ cd /usr/local/spark
$ ./sbin/stop-all.sh
```
Check whether services have been started
To check daemons on master and slaves, use the following command.
```
$ jps
```
Spark Web UI
Browse the Spark UI to know about worker nodes, running application, cluster resources.
Spark Master UI
```
http://master:8080/
```
### Step 5: Using Spark in python
make sure your services are running by starting all spark services
first we need to install findspark to search for spark
activate your foxhound virtual environment
```
(venv) $ pip install findspark pyspark
```
create a python script
```python
import random
import findspark
from pyspark import SparkContext

findspark.init()
sc = SparkContext(appName="EstimatePi")
def inside(p):
    x, y = random.random(), random.random()
    return x*x + y*y < 1
NUM_SAMPLES = 1000000
count = sc.parallelize(range(0, NUM_SAMPLES)) \
             .filter(inside).count()
print("Pi is roughly %f" % (4.0 * count / NUM_SAMPLES))
sc.stop()
```




# Notes:
> Please create a branch when you are creating a new feature. However small it may be, please create a new branch.

> Commit your work as often as possible. Please write proper commit messages explaining what has been done in the commit.

