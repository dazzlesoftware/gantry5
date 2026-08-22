<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Controller;

/**
 * Interface RestfulControllerInterface
 * @package Genesis\Component\Controller
 */
interface RestfulControllerInterface
{
    /**
     * @example GET /resources
     *
     * @return mixed
     */
    public function index(): mixed;

    /**
     * @example GET /resources/:id
     *
     * @param string $id
     * @return mixed
     */
    public function display(mixed $id): mixed;

    /**
     * Special sub-resource to create a new resource (returns a form).
     *
     * @example GET /resources/create
     *
     * @return mixed
     */
    public function create(): mixed;

    /**
     * Special sub-resource to edit existing resource (returns a form).
     *
     * @example GET /resources/:id/edit
     *
     * @param string $id
     * @return mixed
     */
    public function edit(mixed $id): mixed;

    /**
     * @example POST /resources
     *
     * @return mixed
     */
    public function store(): mixed;

    /**
     * @example PUT /resources/:id
     *
     * @param string $id
     * @return mixed
     */
    public function replace(mixed $id): mixed;

    /**
     * @example PATCH /resources/:id
     *
     * @param string $id
     * @return mixed
     */
    public function update(mixed $id): mixed;

    /**
     * @example DELETE /resources/:id
     *
     * @param string $id
     * @return mixed
     */
    public function destroy(mixed $id): mixed;
}
