# **How to use MLEngine**
### <u> Initialization :</u>
1. Initialize oject for Initialize with params, (dir_to_parse, ip_profile_dir,)
> *dir_to_parse:* Location where all the unprocessed csv are stored
>
> *ip_profile_path:* Location where profiles of ips are stored after generating it using **parse_all_csv()** method
>
>> Example : init = Initialize("../inputs/traffic_logs", "../outputs/ip_profile")

2. Use **parse_all_csv()** method of Initialize object to parse all csv's to create ips profile brefore creating models and predicting
<u>This step should only be called when you want to create ip profile from unprocessed csv</u>
>> Example : init.parse_all_csv()

### <u> Model Creation & Prediction :</u>
1. Initialize oject for MLEngine with params, (ip_profile_path, ip_model_path,
   daily_csv_path, anomalies_csv_output_path)
> *ip_profile_path:* Location where profiles of ips are stored after generating it using **parse_all_csv()** method
>
> *ip_model_path:* Location where models for ips are stored after creating it using **create_model()** method
>
> *daily_csv_path:* Location where all the latest csv's are stored and we want to use **_predict_anomalies()** method
>
> *anomalies_csv_output_path:* Location where all the anomaly csv's are stored after using **_predict_anomalies()** method
>
>> Example : mle = MLEngine("../outputs/ip_profile", "../outputs/ip_model", "../inputs/traffic_logs", "../outputs/anomaly_logs")



2. Call method **run(create_model=False, predict=False)** as required
> *create_model:* Setting it *True* will call the method  **_create_model()** which create and update models for the ip profiles.
>
> *predict:* Setting it *True* will call the method **_predict_anomalies()** which looks through the *daily_csv_path* directory and finds anomalies and saves dataframe of anomalies to csv at anomalies_csv_output_path
>
>> Examples : mle.run(create_model=True), mle.run(predict=True)



Tasks:
1. <s> delete functions (unnecessary) </s>
2. Model creation
> 1. creating labelled dataset from auxillary task, and then regression model for each ip address

3. Handling str to numerical conversion caveat i.e. num("192.168") being equal
   to num("861.291") by using weighted sum.
4. <s>  Add documentation </s>

.........
