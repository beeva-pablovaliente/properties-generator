var properties = require ("properties");
var csv = require('csv');
var fs = require('fs');
var commander = require("commander");
var colors = require("colors");
var mkdirp = require('mkdirp');

function list(val) {
  return val.split(',');
}

//Procesamos los argumentos recibidos
commander
	.version('0.0.1')
	.usage(': node app.js [options]')
	//.option('-e, --environment <ENV>', 'Select the environment to generate the properties. Default DEV', list, ['DEV'])
	.option('-e, --environment <ENV>', 'Select the environment to generate the properties. Default DEV', 'DEV')
	.option('-i, --input <file>', 'CSV File to read')
	.option('-o, --output <directory>', 'Directory to store the generated files. It must exist')
	.option('-s, --section <column>', 'The name of the column to use as Section name. Default Seccion', 'Seccion')
	.option('--type <type>', 'Type of the generated file [properties | ini]', 'properties')
	.option('--delimiterChar <char>', 'Character to delimit the columns in the CSV file', '#')
	.option('--defaultColumn <col>', 'If the enviroment selected has no value set, select the value from this column. Default DEV', 'DEV')
  	.parse(process.argv);

var env = commander.environment;
var defaultColumn = commander.defaultColumn;
var extension = '.'+commander.type;
var section = commander.section;

//Comprobamos que los parametros de entrada sean correctos
(function checkParameters(commander){
	if (!commander.input ||	!commander.output){
		commander.help();
		process.exit(1);
	}

	console.log("----------------------------------------");
	console.log("Selected Environment: %s".yellow, env.magenta);
	console.log("Column to select for default value: %s".yellow, defaultColumn.magenta);
	console.log("Generating ".yellow + extension.magenta + " files".yellow);
	console.log("----------------------------------------");
	
})(commander);

//Variable para generar cada property
var stringifier;

//Variables para controlar el nombre del fichero a escribir y cuantos ficheros se han escrito
var fileName = '';
var fileNumber = 0;
//Variable para controlar el nombre de la seccion
var sectionName = '';

//Codificacion de los ficheros de entrada y salida
var fs_enconding = { encoding: 'utf8' };

//Caracter de Comentario para los ficheros properties de salida
var optionsStr = { comment: "#" };

/*
 * Indica si debemos filtrar una columna del fichero de entrada
 * y evitar que se propague en la salida
 */
function filterRow(row){
	if (row['Fichero'] === '\\\\'){
		return true;
	}
}

/*
 * Escribe en el fichero 'filename' los datos especificados en 'data'
 */
function writeData(filename, data){
	var outputDir = commander.output.indexOf('/', commander.output.length - '/'.length) !== -1 ? commander.output : commander.output+'/';

	outputDir = outputDir + env + '/';

	//Si el directorio de destino no existe, lo creamos antes de intentar escribir
	if (!fs.existsSync(outputDir)){
		//fs.mkdirSync(outputDir);
		mkdirp.sync(outputDir, { mode : 0755});
	}

	if (filename !== ''){
		fs.writeFile(outputDir+filename+extension, data, fs_enconding, function (err) {
		  if (err) {
		  	console.log(err);
		  	throw err;
		  }
		  
		  console.log('Generado: '.green + outputDir+filename+extension);
		});
	}
}

function checkSection(row, stringifier){
	if (extension === '.ini'){
		if (row[section] !== sectionName){
			stringifier.section(row[section]);
			sectionName = row[section];
		}
	}
}

/*
 * Abre el flujo de lectura del fichero csv y procesa una a una cada línea
 */
fs.createReadStream(commander.input,fs_enconding)
	.pipe(csv.parse({delimiter: '#', columns:true, skip_empty_lines:true}))
	.pipe(csv.transform(function(row) {
	    if (row['Fichero'] !== fileName && !filterRow(row)){
	    	//Indicamos el cambio de fichero
	    	fileNumber++;

	    	//Escribimos en disco el anterior fichero que se estaba procesando (si habia alguno procesado ya)
	    	writeData(fileName, properties.stringify (stringifier, optionsStr));
	    	//Actualizamos el nombre del nuevo fichero a generar
	    	fileName = row['Fichero'];//La proxima vez que el nombre del fichero cambie, será este fichero el que se escriba

	    	//Reinicializamos nuestro stringifier
	    	stringifier = properties.createStringifier();

			//Comprobamos si es necesario añadir alguna sección
			checkSection(row, stringifier);

	    	//Añadimos la propiedad que acabamos de leer
	    	row[env] === '' ? stringifier.property ({ key: row['Property'], value: row[defaultColumn] }) : stringifier.property ({ key: row['Property'], value: row[env] });

	    	//stringifier.section({ name: "my section", comment: "My Section" });
	    }else if(!filterRow(row)){

	    	//Comprobamos si es necesario añadir alguna sección
	    	checkSection(row, stringifier);

	    	row[env] === '' ? stringifier.property ({ key: row['Property'], value: row[defaultColumn] }) : stringifier.property ({ key: row['Property'], value: row[env] });
	    }
	    // handle each row before the "end" or "error" stuff happens above
	}))
	.on('readable', function(){
  		//console.log('readable');
  		//Sin capturar este evento no salta el evento 'end'
	})
	.on('end', function() {
    	console.log('Generados %s ficheros'.grey, fileNumber);
    	
    	//Antes de terminar, volcamos el contenido de la variabla al fichero correspondiente
	    writeData(fileName, properties.stringify (stringifier, optionsStr));
	})
	.on('error', function(error) {
    	console.log("Error: "+error);
	});
