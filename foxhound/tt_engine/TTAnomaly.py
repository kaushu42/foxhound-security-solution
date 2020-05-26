import os
import datetime
import traceback
from pyspark.sql.functions import lit, to_timestamp
from foxhound.logger import Logger


class TTAnomaly:
    def __init__(self, input_dir, *, spark):
        self._csvs = self._get_files(input_dir)
        self._spark = spark

    def _get_files(self, path, filetype='csv'):
        return [os.path.join(path, f) for f in os.listdir(path) if f.endswith('csv')]

    def _read_table_from_postgres(self, table):
        url = Config.SPARK_DB_URL
        properties = {
            'user': Config.FH_DB_USER,
            'password': Config.FH_DB_PASSWORD,
            'driver': Config.SPARK_DB_DRIVER
        }
        return self._spark.read.jdbc(
            url='jdbc:%s' % url,
            table=table,
            properties=properties
        )

    def _write_df_to_postgres(self, df, table_name, mode='append'):
        url = Config.SPARK_DB_URL
        df.write.format('jdbc').options(
            url='jdbc:%s' % url,
            driver=Config.SPARK_DB_DRIVER,
            dbtable=table_name,
            user=Config.FH_DB_USER,
            password=Config.FH_DB_PASSWORD).mode(mode).save()

    def run(self):
        logger = Logger.getInstance()
        logger.info('TT Engine started')
        for csv in self._csvs:
            try:
                logger.info(f'TT Engine: {csv}')
                csv_name = os.path.basename(csv)

                df = self._spark.read.csv(csv, header=True, inferSchema=True)
                df = df.withColumn('logged_datetime', to_timestamp(
                    df.logged_datetime, 'yyyy/mm/dd'))
                firewall_rules = self._read_table_from_postgres(
                    'core_firewallrule')
                logs = self._read_table_from_postgres('core_trafficlog')
                mapped = df.join(logs,
                                 on=[df.log_name == logs.log_name],
                                 ).drop('log_name').withColumnRenamed('id', 'log_id').drop(*logs.columns)
                mapped = mapped.join(firewall_rules, on=[
                    mapped.firewall_rule_id == firewall_rules.name
                ]).drop('firewall_rule_id').withColumnRenamed('id', 'firewall_rule_id').drop(*firewall_rules.columns)
                mapped = mapped.drop('virtual_system_id', 'inbound_interface_id', 'outbound_interface_id')\
                    .withColumnRenamed('source_ip_id', 'source_ip')\
                    .withColumnRenamed('destination_ip_id', 'destination_ip')\
                    .withColumnRenamed('application_id', 'application')\
                    .withColumnRenamed('source_zone_id', 'source_zone')\
                    .withColumnRenamed('destination_zone_id', 'destination_zone')\
                    .withColumnRenamed('protocol_id', 'protocol')\
                    .withColumnRenamed('action_id', 'action')\
                    .withColumnRenamed('session_end_reason_id', 'session_end_reason')\
                    .withColumnRenamed('category_id', 'category')\
                    .withColumn('created_datetime', lit(datetime.datetime.now()))\
                    .withColumn('is_closed', lit(False))
                self._write_df_to_postgres(
                    mapped, 'troubleticket_troubleticketanomaly')
            except Exception as e:
                logger.error(str(traceback.format_exc()))
                logger.info(f'Skipping {csv}')
                continue
        logger.info('TT Engine: Done')
