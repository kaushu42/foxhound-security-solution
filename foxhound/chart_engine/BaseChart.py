from foxhound.config import Config


class BaseChart:
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
