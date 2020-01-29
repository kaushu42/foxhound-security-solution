import os

from pyspark.sql.functions import lit


class DBEngine:
    def __init__(self, detail_input_dir, granular_input_dir, *, spark):
        self._detail_csvs = self._get_files(detail_input_dir)
        self._granular_csvs = self._get_files(granular_input_dir)
        self._spark = spark

    def _get_files(self, path, filetype='csv'):
        return [os.path.join(path, f) for f in os.listdir(path) if f.endswith('csv')]

    def _read_table_from_postgres(self, table):
        url = 'postgresql://localhost/fhdb'
        properties = {
            'user': 'foxhounduser',
            'password': 'foxhound123',
            'driver': 'org.postgresql.Driver'
        }
        return self._spark.read.jdbc(
            url='jdbc:%s' % url,
            table=table,
            properties=properties
        )

    def _write_df_to_postgres(self, df, table_name, mode='append'):
        url = 'postgresql://localhost/fhdb'
        df.write.format('jdbc').options(
            url='jdbc:%s' % url,
            driver='org.postgresql.Driver',
            dbtable=table_name,
            user='foxhounduser',
            password='foxhound123').mode(mode).save()

    def run(self, verbose=True):
        print('******RUNNING DB ENGINE******')
        for csv in self._granular_csvs:
            print(f'\t ******Processing: {csv}******')
            df = self._spark.read.csv(csv, header=True, inferSchema=True)
            csv_name = os.path.basename(csv)
            firewall_rules = self._read_table_from_postgres(
                'core_firewallrule')
            logs = self._read_table_from_postgres('core_trafficlog')
            log_id = logs.where(logs.log_name == csv_name).collect()[0].id
            mapped = df.join(
                firewall_rules,
                on=[df.firewall_rule_id == firewall_rules.name]
            )\
                .drop('source_port', 'firewall_rule_id', 'name', 'tenant_id', 'virtual_system_id')\
                .withColumnRenamed('id', 'firewall_rule_id')\
                .withColumnRenamed('source_ip_id', 'source_ip')\
                .withColumnRenamed('destination_ip_id', 'destination_ip')\
                .withColumnRenamed('application_id', 'application')\
                .withColumnRenamed('source_zone_id', 'source_zone')\
                .withColumnRenamed('destination_zone_id', 'destination_zone')\
                .withColumnRenamed('protocol_id', 'protocol')\
                .withColumnRenamed('inbound_interface_id', 'inbound_interface')\
                .withColumnRenamed('outbound_interface_id', 'outbound_interface')\
                .withColumnRenamed('action_id', 'action')\
                .withColumnRenamed('session_end_reason_id', 'session_end_reason')\
                .withColumnRenamed('category_id', 'category')
        mapped = mapped.withColumn('traffic_log_id', lit(log_id))
        self._write_df_to_postgres(
            mapped, 'core_trafficlogdetailgranularhour')
