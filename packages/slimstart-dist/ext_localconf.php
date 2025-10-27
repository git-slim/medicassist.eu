<?php

defined('TYPO3') or die();

$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slimstart_dist'] = 'EXT:slimstart_dist/Configuration/RTE/SlimstartDist.yaml';

$GLOBALS['TYPO3_CONF_VARS']['SYS']['fluid']['namespaces']['slim'][] = 'WeAreSlim\\SlimStart\\ViewHelpers';

$GLOBALS['TYPO3_CONF_VARS']['SYS']['fluid']['namespaces']['vite'] = ['Crazy252\\Typo3Vite\\ViewHelpers'];

$GLOBALS['TYPO3_CONF_VARS']['SYS']['fluid']['namespaces']['ui'] = [
    \WeAreSlim\SlimstartDist\Components\ComponentCollection::class,
];
