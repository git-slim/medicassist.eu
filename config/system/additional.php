<?php

if (getenv('IS_DDEV_PROJECT') == 'true') {
    $GLOBALS['TYPO3_CONF_VARS'] = array_replace_recursive(
        $GLOBALS['TYPO3_CONF_VARS'],
        [
            'DB' => [
                'Connections' => [
                    'Default' => [
                        'dbname' => 'db',
                        'driver' => 'mysqli',
                        'host' => 'db',
                        'password' => 'db',
                        'port' => '3306',
                        'user' => 'db',
                    ],
                ],
            ],
            // This GFX configuration allows processing by installed ImageMagick 6
            'GFX' => [
                'processor' => 'ImageMagick',
                'processor_path' => '/usr/bin/',
                'processor_path_lzw' => '/usr/bin/',
            ],
            // This mail configuration sends all emails to mailpit
            'MAIL' => [
                'transport' => 'smtp',
                'transport_smtp_encrypt' => false,
                'transport_smtp_server' => 'localhost:1025',
            ],
            'SYS' => [
                'trustedHostsPattern' => '.*.*',
                'devIPmask' => '*',
                'displayErrors' => 1,
                'exceptionalErrors' => 12290,
                'caching' => [
                    'cacheConfigurations' => [
                        'l10n' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                        'hash' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                        'pages' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                        'typoscript' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                        'core' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                        'rootline' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                        'extbase' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                        'database_schema' => [
                            'backend' => 'TYPO3\CMS\Core\Cache\Backend\NullBackend',
                        ],
                    ],
                ],
            ],
            'BE' => [
                'sessionTimeout' => 36000,
                'debug' => 1,
            ],
            'FE' => [
                'debug' => 1,
            ],
        ]
    );
}
