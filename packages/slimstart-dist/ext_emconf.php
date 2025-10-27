<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'slimstart dist',
    'description' => 'Sitepackage for slimstart',
    'category' => 'templates',
    'version' => '0.0.1',
    'state' => 'alpha',
    'author' => 'Joost Ramke',
    'constraints' => [
        'depends' => [
            'slimstart' => '*',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
