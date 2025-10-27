<?php

namespace WeAreSlim\SlimstartDist\Components;

use TYPO3Fluid\Fluid\Core\Component\AbstractComponentCollection;
use TYPO3Fluid\Fluid\View\TemplatePaths;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

final class ComponentCollection extends AbstractComponentCollection
{
    public function getTemplatePaths(): TemplatePaths
    {
        $templatePaths = new TemplatePaths();
        $templatePaths->setTemplateRootPaths([
            ExtensionManagementUtility::extPath('slimstart_dist', 'Resources/Private/Components/ui'),
            ExtensionManagementUtility::extPath('slimstart_dist', 'Resources/Private/Components'),
        ]);
        return $templatePaths;
    }
}
