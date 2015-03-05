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

  Usage: app : node app.js -i <file> -o <directory> [options]

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -i, --input <file>                CSV File to read
    -o, --output <directory>          Directory to store the generated files. It must be writtable
    -e, --environment <ENV>           Select the environment(s) to generate the properties for. Default LOC,DEV,PRE,PRO
    -s, --section <column>            The name of the column to use as Section name. Default: Seccion
    -t, --type <type>                 Type of the generated file(s) [properties | ini | yml | yaml]. Default: properties
    -f, --filterFiles <regexp_files>  RegExp to generate only the files that match. Example: files that end with th: th$
    --delimiterChar <char>            Character to delimit the columns in the CSV file. Default: #
    --defaultEnv <col>                If the enviroment selected has no value set, select the value from this column. Default: DEV
    
Obs.- althoug it is mainly prepared for "properties format", it admits "yml|yaml" type, if you choose that type, the program will use ":" separator for key:value instead of "=", also, when -t yml is chosen, it will replace the string .IDENTATION. by two blank spaces and the string .SPACE. for one, this way you can obtain a yaml format file.