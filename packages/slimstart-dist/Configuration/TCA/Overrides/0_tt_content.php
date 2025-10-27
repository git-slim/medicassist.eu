<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') or die();

$llCb = 'LLL:EXT:slimstart_dist/ContentBlocks/default.xlf';

$headerFields = [
    'header_appearance' => [
        'label' => 'LLL:EXT:slimstart_dist/ContentBlocks/default.xlf:fields.header_appearance.label',
        'exclude' => 1,
        'config' => [
            'type' => 'select',
            'renderType' => 'selectSingle',
            'default' => '0',
            'items' => [
                [
                    'label' => 'Automatisch',
                    'value' => '0',
                ],
                [
                    'label' => 'H1',
                    'value' => '1',
                ],
                [
                    'label' => 'H2',
                    'value' => '2',
                ],
                [
                    'label' => 'H3',
                    'value' => '3',
                ],
                [
                    'label' => 'H4',
                    'value' => '4',
                ],
                [
                    'label' => 'H5',
                    'value' => '5',
                ],
            ],
        ],
    ],
    'semantic_heading_type' => [
        'label' => 'LLL:EXT:slimstart_dist/ContentBlocks/default.xlf:fields.semantic_heading_type.label',
        'description' => 'LLL:EXT:slimstart_dist/ContentBlocks/default.xlf:fields.semantic_heading_type.description',
        'exclude' => 1,
        'displayCond' => [
            'AND' => [
                'FIELD:header:REQ:true',
                'FIELD:subheader:REQ:true',
            ],
        ],
        'config' => [
            'type' => 'select',
            'renderType' => 'selectSingle',
            'default' => 'tagline',
            'items' => [
                [
                    'label' => 'Tagline',
                    'value' => 'tagline',
                ],
                [
                    'label' => 'Überschrift',
                    'value' => 'header',
                ],
            ],
        ],
    ],
];
ExtensionManagementUtility::addTCAcolumns('tt_content', $headerFields);

// Update labels of core fields
$GLOBALS['TCA']['tt_content']['columns']['subheader']['label'] = "{$llCb}:fields.subheader.label";
$GLOBALS['TCA']['tt_content']['columns']['header_layout']['label'] = "{$llCb}:fields.header_layout.label";
