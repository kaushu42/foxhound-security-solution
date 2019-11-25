# **How to use MLEngine**
### <u> Initialization :</u>
1. Initialize oject for Initialize with params, (dir_to_parse, tenant_profile_dir,)
> *dir_to_parse:* Location where all the unprocessed csv are stored
>
> *tenant_profile_path:* Location where profiles of tenants are stored after generating it using **parse_all_csv()** method
>
>> Example : init = Initialize("../inputs/traffic_logs", "../outputs/tenant_profile")

2. Use **parse_all_csv()** method of Initialize object to parse all csv's to create tenant profile brefore creating models and predicting
<u>This step should only be called when you want to create tenant profile from unprocessed csv</u>
>> Example : init.parse_all_csv()

### <u> Model Creation & Prediction :</u>
1. Initialize oject for MLEngine with params, (tenant_profile_path, tenant_model_path,
   daily_csv_path, anomalies_csv_output_path)
> *tenant_profile_path:* Location where profile of tenants are stored after generating it using **parse_all_csv()** method
>
> *tenant_model_path:* Location where models for tenant are stored after creating it using **create_model()** method
>
> *daily_csv_path:* Location where all the latest csv's are stored and we want to use **_predict_anomalies()** method
>
> *anomalies_csv_output_path:* Location where all the anomaly csv's are stored after using **_predict_anomalies()** method
>
>> Example : mle = MLEngine("../outputs/tenant_profile", "../outputs/tenant_model", "../inputs/traffic_logs", "../outputs/anomaly_logs")



2. Call method **run(create_model=False, predict=False)** as required
> *create_model:* Setting it *True* will call the method  **_create_model()** which create and update models for the ip profiles.
>
> *predict:* Setting it *True* will call the method **_predict_anomalies()** which looks through the *daily_csv_path* directory and finds anomalies and saves dataframe of anomalies to csv at anomalies_csv_output_path
>
>> Examples : mle.run(create_model=True), mle.run(predict=True)



Tasks:
1. Visualization
2. Create model for ips of tenant
3. Work on representation of data
4. <s>  Add documentation </s>

.........
