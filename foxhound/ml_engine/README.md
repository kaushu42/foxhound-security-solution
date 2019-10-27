## How to use MLEngine
### <u> *Steps* </u>
1. Initialize boject for MLEngine with params, (ip_profile_path, ip_model_path,
   daily_csv_path)
> *ip_profile_path:* Location where profiles of ips are stored after generating it using **parse_all_csv()** method
>
> *ip_model_path:* Location where models for ips are stored after creating it using **create_model()** method
>
> *daily_csv_path:* Location where all the latest csv's are stored and we want to use **_predict_anomalies()** method
>
>> Example : MLE = MLEngine("../profile", "../model", "../daily")

2. Use **parse_all_csv(csv_to_parse_dir)** method to parse all csv's to create ips profile brefore creating models and predicting
<u>This step should only be called when you want to create ip profile from unprocessed csv</u>
> *csv_to_parse_dir:* Location where all the unprocessed csv are stored
>
>> Example : MLE.parse_all_csv("../history")

3. Call method **run(create_model=False, predict=False)** as required
> *create_model:* Setting it *True* will call the method  **_create_model()** which create and update models for the ip profiles.
>
> *predict:* Setting it *True* will call the method **_predict_anomalies()** which looks through the *daily_csv_path* directory and finds anomalies and returns dataframe of anomalies.
>
>> Examples : MLE.run(create_model=True), MLE.run(predict=True)



Tasks:
1. <s> delete functions (unnecessary) </s>
2. Model creation
> 1. creating labelled dataset from auxillary task, and then regression model for each ip address

3. Handling str to numerical conversion caveat i.e. num("192.168") being equal
   to num("861.291") by using weighted sum.
4. <s>  Add documentation </s>

.........
