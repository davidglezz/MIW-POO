La aplicacion desarrollada permite la validación de datos estructurados
en formato json+ld de cualquier tipo definido en schema.org.

Para ello es necesario tener la definición del vocabulario en el mismo formato json-ld.

Solo se ha implementado el apartado opcional de seguridad, pidiendo la contraseña "1234"
al intentar eliminar un objeto.

Me gustaría que se descargara del repositorio oficial la última versión disponible:
Descargar: https://github.com/davidglezz/MIW-POO/archive/master.zip


Código fuente & Repositorio
===========================
https://github.com/davidglezz/MIW-POO


URLs en la que estarán desplegados
==================================
- Cliente:         http://156.35.98.110:8000
- Servicio PHP:    http://156.35.98.110:8001
- Servicio NodeJS: http://156.35.98.110:8002
- Servicio Python: http://156.35.98.110:8003


Limitaciones
- No soporta enumerados, como InStock y OutOfStock de Product:
    - subtypes: "rdfs:subClassOf": "http://schema.org/Enumeration"
- No soporta validacion de valores defindos o en los que este involucrado las definiciones
    - http://schema.org/supersededBy
    - rdfs:subPropertyOf (Relates a term (property, class or enumeration) to one that supersedes it)

