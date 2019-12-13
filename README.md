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
// it will ask you for file to store key, just press enter and continue
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
$ sudo apt install openjdk-8-jdk
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
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
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
from __future__ import print_function

import sys
from random import random
from operator import add
import findspark
findspark.init()

from pyspark.sql import SparkSession


if __name__ == "__main__":
    """
        Usage: pi [partitions]
    """
    spark = SparkSession\
        .builder\
        .appName("PythonPi")\
        .getOrCreate()

    partitions = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    n = 100000 * partitions

    def f(_):
        x = random() * 2 - 1
        y = random() * 2 - 1
        return 1 if x ** 2 + y ** 2 <= 1 else 0

    count = spark.sparkContext.parallelize(range(1, n + 1), partitions).map(f).reduce(add)
    print("Pi is roughly %f" % (4.0 * count / n))

    spark.stop()
```


# Pre-Cassandra setup

### Make sure you have specific version of JDK set as default that is 1.8

```
sudo update-alternatives --config java

```
This is what the output would look like if you’ve installed all versions of Java in this tutorial:

There are many choices for the alternative java (providing /usr/bin/java).

  Selection    Path                                            Priority   Status
------------------------------------------------------------
* 0            /usr/lib/jvm/java-11-openjdk-amd64/bin/java      1101      auto mode
  1            /usr/lib/jvm/java-11-openjdk-amd64/bin/java      1101      manual mode
  2            /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java   1081      manual mode
  3            /usr/lib/jvm/java-8-oracle/jre/bin/java          1081      manual mode

Choose the number associated with the Java version to use it as the default(/usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java), 
You can do this for other Java commands, such as the compiler (javac):
```
sudo update-alternatives --config javac
```

```
sudo nano /etc/environment
```
At the end of this file, add the following line, making sure to replace the highlighted path with your own copied path:

```
JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64/jre/bin/"
```
Modifying this file will set the JAVA_HOME path for all users on your system.

Save the file and exit the editor.

Now reload this file to apply the changes to your current session:

```
source /etc/environment
```


# Installing Cassandra to your local machine

### Step 1: Add the Cassandra Repository File

```
echo "deb http://www.apache.org/dist/cassandra/debian 39x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
```
### Step 2: Add the GPG Key

```
sudo apt install curl
curl https://www.apache.org/dist/cassandra/KEYS | sudo apt-key add -
```
### Step 3: Install Cassandra on Ubuntu
```
sudo apt update
sudo apt install cassandra
```

### Step 4: Enable and Start Cassandra
```
sudo systemctl enable cassandra
sudo systemctl start cassandra

```

### Step 5: Verify The Installation
```
sudo systemctl status cassandra
```

### Step 6: Configure Cassandra to run in sinlge node mode

```
sudo systemctl stop cassandra
sudo nano /etc/cassandra/cassandra.yaml
```

```
. . .

cluster_name: 'FoxhoundClustere'

. . .

seed_provider:
  - class_name: org.apache.cassandra.locator.SimpleSeedProvider
    parameters:
         - seeds: "127.0.0.1"

. . .

listen_address: 127.0.0.1

. . .

rpc_address: 127.0.0.1

. . .

endpoint_snitch: GossipingPropertyFileSnitch

. . . 

```

### Step 7: Configuring Cassandra-env.sh

```
sudo nano /etc/cassandra/cassandra-env.sh
``` 

look for line JVM_OPTS="$JVM_OPTS -

replace the line with
```
JVM_OPTS="$JVM_OPTS -Djava.rmi.server.hostname=127.0.0.1
```
Save the file and restart the cassandra using 

```
sudo systemctl restart cassandra.service
```

### Step 8: Configuring the Firewall

```
sudo apt install iptables-persistent
```
continue pressing all yeses

To modify the firewall rules, open the rules file for IPv4.

```
sudo nano /etc/iptables/rules.v4
```
```
Copy and paste the following line within the INPUT chain,
-A INPUT -p tcp -s 127.0.0.1 -m multiport --dports 7000,9042 -m state --state NEW,ESTABLISHED -j ACCEPT
```
After adding the rule, save and close the file, then restart IPTables.
```
sudo service netfilter-persistent  restart
```


### check the cluster status
```
$ sudo nodetool status
```
```
Datacenter: dc1
===============
Status=Up/Down
|/ State=Normal/Leaving/Joining/Moving
--  Address    Load       Tokens       Owns (effective)  Host ID                               Rack
UN  127.0.0.1  203.61 KiB  256          100.0%            2e2fad33-e7db-462d-89e6-4b36482a3829  rack1
```

something like this should appear


At the bottom of the file, add in the auto_bootstrap directive by pasting in this line:
```
auto_bootstrap: false
```




First, restart the Cassandra daemon on each.
```
sudo service cassandra start
```

To check the status of the cassandra db
```
sudo nodetool status
```




# Notes:
> Please create a branch when you are creating a new feature. However small it may be, please create a new branch.

> Commit your work as often as possible. Please write proper commit messages explaining what has been done in the commit.

