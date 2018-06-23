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
            'rdfs:Class' => function($obj, $context = '') {
                // Type
                if (!array_key_exists('@type', $obj)) {
                    return ['@type not found on input object.'];
                }
                $type = $obj['@type'];

                // Context
                $context = isset($obj['@context']) ? $obj['@context'] : $context;
                if (!empty($context) && strrpos($context, '/') !== strlen($context) - 1) {
                    $context .= '/';
                }

                // Exist in the vocabulary?
                $klass = $this->schema->get($context.$type);
                if (!$klass || (isset($klass['@type']) && $klass['@type'] !== 'rdfs:Class')) {
                    return ["Type '$type' not found in the vocabulary."];
                }

                // Properties
                $errors = [];
                foreach ($obj as $id => $value) {
                    if (substr($id, 0, 1) === '@') continue;  // ignore @..
                    $propertyErrors = $this->validators['rdf:Property']($id, $value, $context, $type);
                    if (count($propertyErrors) > 0) {
                        //$errors[] = "Property '$id' not valid:";
                        $errors = array_merge($errors, $propertyErrors);
                    }
                }
                return $errors;
            },
            'rdf:Property' => function ($id, $value, $context, $type) {
                // Is there property in the vocabulary?
                $prop = $this->schema->get($context.$id);
                if ($prop === null || !array_key_exists('@type', $prop) || $prop['@type'] !== 'rdf:Property') {
                    return ["Property '$id' not found in vocabulary."];
                }

                // Does the property belong to the class/type/shape + Inheritance (in Parents)?
                $classes = $this->schema->getSuperClasses($context.$type);
                $propertyClasses = $this->getArray($prop['http://schema.org/domainIncludes']);
                if (count(array_intersect($classes, $propertyClasses)) === 0) {
                    return ["Property '$id' not found in '$type'."];
                }

                // Validate property value
                $This = $this;
                $propertyValueValidator = function ($val, $i = -1) use ($This, $id, $prop, $context)
                {
                    $propName = $i >= 0 ? "$id[$i]" : $id;
                    $isValid = false;
                    $errors = [];
                    foreach ($This->getArray($prop['http://schema.org/rangeIncludes']) as $valueTypeId) {
                        $validator = is_string($val) ? $valueTypeId : 'rdfs:Class';
                        
                        if (!array_key_exists($validator, $This->validators)) {
                            $isValid = true; // Considerar como correcto.
                            // $errors[] = "Type '$propName' can't be validated due to input data type.";
                            break;
                        }

                        // Extra type check for rdfs:Class
                        if ($validator === 'rdfs:Class' && isset($val['@type'])) {
                            $realValueType = $context.$val['@type'];
                            $expectedTypes = $This->schema->getSuperClasses($valueTypeId);

                            if (!in_array($realValueType, $expectedTypes)) {
                                $errors[] = "Type '$realValueType' does not match the type '$valueTypeId' of the property.";
                                continue;
                            }
                        }

                        $result = $This->validators[$validator]($val);
                        if ($result === true || count($result) === 0) {
                            $isValid = true;
                            break;
                        }

                        // TODO validators must return array instead of boolean
                        if (is_array($result)) {
                            $errors = array_merge($errors, $result);
                        } elseif (!$result) {
                            $errors[] = "'$id' is not valid $valueTypeId.";
                        }
                    }

                    if (!$isValid) {
                        return ["Property '$propName' not valid because:", $errors];
                    }

                    return []; // All ok, return 0 errors
                };

                if (is_array($value)) {
                    $errErr = [];
                    foreach ($value as $val) {
                        $errErr[] = $propertyValueValidator($val);
                    }
                    return array_merge(...$errErr);
                } else {
                    return $propertyValueValidator($value);
                }
            },
            'http://schema.org/Date' => function($value) {
                // A date value in <a href=\"http://en.wikipedia.org/wiki/ISO_8601\">ISO 8601 date format</a>.
                $date = \DateTime::createFromFormat('Y-m-d', $value);
                return $date && $date->format('Y-m-d') == $value;
            },
            'http://schema.org/Time' => function($value) {
                // A point in time recurring on multiple days in the form hh:mm:ss[Z|(+|-)hh:mm] (see <a href=\"http://www.w3.org/TR/xmlschema-2/#time\">XML schema for details</a>).
                // TODO timezone
                $time = \DateTime::createFromFormat('hh:mm:ss', $value);
                return $time && $time->format('hh:mm:ss') == $value;
            },
            'http://schema.org/Number' => function($value) {
                return $this->validators['http://schema.org/Integer']($value)
                    || $this->validators['http://schema.org/Float']($value);
            },
            'http://schema.org/Integer' => function($value) {
                return $value[0] == '-' ? ctype_digit(substr($value, 1)) : ctype_digit($value);
            },
            'http://schema.org/Float' => function($value) {
                return ((string) floatval($value)) === $value; // TODO
            },
            'http://schema.org/Text' => function($value) {
                return true;
            },
            'http://schema.org/URL' => function($value) {
                return true; // TODO
            },
            'http://schema.org/Boolean' => function($value) {
                return $this->validators['http://schema.org/False']($value)
                    || $this->validators['http://schema.org/True']($value);
            },
            'http://schema.org/False' => function($value) {
                return $value === "False" || $value === "http://schema.org/False";
            },
            'http://schema.org/True' => function($value) {
                return $value === "True" || $value === "http://schema.org/True";
            },
            'http://schema.org/DateTime' => function($value) {
                // A combination of date and time of day in the form:
                // [-]CCYY-MM-DDThh:mm:ss[Z|(+|-)hh:mm] (see Chapter 5.4 of ISO 8601).
                $dt = \DateTime::createFromFormat(\DateTime::ISO8601, $value);
                return $dt && $dt->format(\DateTime::ISO8601) == $value;
                return true; // TODO
            }
        ];
    }
    
    public function validate(array $obj, string $context = '')
    {
        try {
            $result = $this->validators['rdfs:Class']($obj, $context);
        } catch (Exception $e) {
            $result = false;
        }
        return $result;
    }

    /**
     * Unas veces es un valor, otras veces es un array de valores
     */
    private function getArray($obj) {
        return isset($obj['@id']) ? [$obj['@id']] : array_column($obj, '@id');
    }

    // TODO Alias "@type": "http://id..."
    // TODO Enumeration subtypes
    // TODO supersededBy -> Relates a term (i.e. a property, class or enumeration) to one that supersedes it.
    // TODO rdfs:subPropertyOf
}
