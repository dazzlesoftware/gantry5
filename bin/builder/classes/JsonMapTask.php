<?php

declare(strict_types=1);

use Phing\Task;

class JsonMapTask extends Task {

    /** @var string|null */
    private ?string $folder = null;
    /** @var string|null */
    private ?string $commit = null;

    /**
     * @param string $folder
     * @return void
     */
    public function setFolder(string $folder): void
    {
        $this->folder = $folder;
    }

    /**
     * @param string $commit
     * @return void
     */
    public function setCommit(string $commit): void
    {
        $this->commit = $commit;
    }

    /**
     * @return void
     */
    public function init(): void
    {
    }

    /**
     * @return void
     */
    public function main(): void
    {
        $folder = $this->folder;
        $commit = $this->commit;

        if ($folder === null || $commit === null) {
            throw new \RuntimeException('Both folder and commit must be configured.');
        }

        $list = [];
        $iterator = new DirectoryIterator($folder);
        /** @var SplFileInfo $fileInfo */
        foreach ($iterator as $fileInfo) {
            if ($fileInfo->isDot() || $fileInfo->isDir()) {
                continue;
            }

            $filename = $fileInfo->getFilename();
            $list[$filename] = [
                'file' => $filename,
                'size' => $fileInfo->getSize(),
                'date' =>  $fileInfo->getMTime()
            ];
        }

        ksort($list);

        $data = [
            'count' => count($list),
            'commit' => $commit,
            'commit_short' => substr($commit, 0, 9),
            'date' => time(),
            'files' => array_values($list)
        ];

        file_put_contents("{$folder}/map.json", json_encode($data, JSON_PRETTY_PRINT));
    }
}
