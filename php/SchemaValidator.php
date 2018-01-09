<?php

namespace POO;

class SchemaValidator
{
    protected $schema;
    protected $validators;

    public function __construct(SchemaReader $schema)
    {
        $this->schema = $schema;
        $this->validators = [
            'http://schema.org/Date' => function($value) {
                // A date value in <a href=\"http://en.wikipedia.org/wiki/ISO_8601\">ISO 8601 date format</a>.
                $date = \DateTime::createFromFormat('Y-m-d', $value);
                return $date && $date->format('Y-m-d') == $value;
            },
            'http://schema.org/Time' => function($value) {
                // A point in time recurring on multiple days in the form hh:mm:ss[Z|(+|-)hh:mm] (see <a href=\"http://www.w3.org/TR/xmlschema-2/#time\">XML schema for details</a>).
                return true; //TODO
            },
            'http://schema.org/Number' => function($value) {
                return $this->validators['http://schema.org/Integer']($value)
                    || $this->validators['http://schema.org/Float']($value);
            },
            'http://schema.org/Integer' => function($value) {
                return $value[0] == '-' ? ctype_digit(substr($value, 1)) : ctype_digit($value);
            },
            'http://schema.org/Float' => function($value) {
                return true; //TODO
            },
            'http://schema.org/Text' => function($value) {
                return true;
            },
            'http://schema.org/URL' => function($value) {
                return true;
            },
            'http://schema.org/Boolean' => function($value) {
                return $this->validators['http://schema.org/False']($value)
                    || $this->validators['http://schema.org/True']($value);
            },
            'http://schema.org/False' => function($value) {
                return $value === "False";
            },
            'http://schema.org/True' => function($value) {
                return $value === "True";
            },
            'http://schema.org/DateTime' => function($value) {
                // A combination of date and time of day in the form [-]CCYY-MM-DDThh:mm:ss[Z|(+|-)hh:mm] (see Chapter 5.4 of ISO 8601).
                return true; //TODO
            }
        ];
    }
    
    public function validate(array $obj, string $context = '')
    {
        $errors = [];

        if (!array_key_exists('@type', $obj)) {
            $errors[] = '@type not found on input object.';
            return $errors;
        }
        
        // Context
        $context = isset($obj['@context']) ? $obj['@context'] : $context;
        if (!empty($context) && strrpos($context, '/') !== strlen($context) - 1) {
            $context .= '/';
        }
        $type = $obj['@type'];

        $classes = $this->schema->getSuperClasses($context.$type);
        if (count($classes) === 0) {
            $errors[] = "Type '$id' not found in schema.";
            return $errors;
        }

        foreach ($obj as $key => $value) {
            if (substr($key, 0, 1) !== '@') {
                $prop = $this->schema->get($context.$key);
                if ($prop === null || !array_key_exists('@type', $prop) || $prop['@type'] !== 'rdf:Property') {
                    $errors[] = "Property '$key' not found in schema.";
                    continue;
                }

                $propertyClasses = $this->getArray($prop['http://schema.org/domainIncludes']);
                if (count(array_intersect($classes, $propertyClasses)) === 0) {
                    $errors[] = "Property '$key' not found in '$type'.";
                    continue;
                }

                $valueTypeErrors = [];
                foreach ($this->getArray($prop['http://schema.org/rangeIncludes']) as $valueTypeId) {
                    $valueType = $this->schema->get($valueTypeId);

                    if (is_array($valueType['@type']) && array_search("http://schema.org/DataType", $valueType['@type']) !== false)
                    {
                        if (!is_string($value)) {
                            $errors[] = "DataType '$key' is not string.";
                            continue;
                        }

                        if ($this->validators[$valueTypeId]($value)) {
                            break;
                        } else {
                            $valueTypeErrors[] = "'$key' is not valid $valueTypeId.";
                        }
                        // TODO
                    } else {
                        $result = $this->validate($value, $context);
                        if (count($result) === 0) {
                            break;
                        }
                        $valueTypeErrors = array_merge($valueTypeErrors, $result);
                    }
                }

                $errors = array_merge($errors, $valueTypeErrors);

                // TODO rdfs:subPropertyOf
                // TODO Alias "@type": "http://id..."
                // TODO Enumeration subtypes
            }
        }
        return $errors;
    }

    /**
     * A veces es un valor, otras veces un array de valores
     */
    private function getArray($obj) {
        return isset($obj['@id']) ? [$obj['@id']] : array_column($obj, '@id');
    }

    
}
