# properties-generator #

Utility to generate properties file from a structured CSV file, to create the folder structure export the following variables

```
PROPERTIES_GENERATOR=/home/antonio/work/properties-generator
CSV_FILE=/home/antonio/work/memento-resources/properties/java/memento-java-properties.csv
OUTPUT_DIR=/var/memento/properties
```

and execute 

```
node $PROPERTIES_GENERATOR/app.js -i $CSV_FILE -o $OUTPUT_DIR --defaultEnv LOC
```