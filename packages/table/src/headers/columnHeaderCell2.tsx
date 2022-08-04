/*
 * Copyright 2022 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from "classnames";
import * as React from "react";

import { AbstractPureComponent2, Utils as CoreUtils, DISPLAYNAME_PREFIX, Icon } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";

import * as Classes from "../common/classes";
import { columnInteractionBarContextTypes, ColumnInteractionBarContextTypes } from "../common/context";
import { LoadableContent } from "../common/loadableContent";
import { CLASSNAME_EXCLUDED_FROM_TEXT_MEASUREMENT } from "../common/utils";
import { HorizontalCellDivider, IColumnHeaderCellProps, IColumnHeaderCellState } from "./columnHeaderCell";
import { HeaderCell } from "./headerCell";

// eslint-disable-next-line deprecation/deprecation
export type ColumnHeaderCellProps = IColumnHeaderCellProps;

export class ColumnHeaderCell2 extends AbstractPureComponent2<ColumnHeaderCellProps, IColumnHeaderCellState> {
    public static displayName = `${DISPLAYNAME_PREFIX}.ColumnHeaderCell2`;

    public static defaultProps: ColumnHeaderCellProps = {
        isActive: false,
        menuIcon: "chevron-down",
    };

    public static contextTypes: React.ValidationMap<ColumnInteractionBarContextTypes> =
        columnInteractionBarContextTypes;

    /**
     * This method determines if a `MouseEvent` was triggered on a target that
     * should be used as the header click/drag target. This enables users of
     * this component to render fully interactive components in their header
     * cells without worry of selection or resize operations from capturing
     * their mouse events.
     */
    public static isHeaderMouseTarget(target: HTMLElement) {
        return (
            target.classList.contains(Classes.TABLE_HEADER) ||
            target.classList.contains(Classes.TABLE_COLUMN_NAME) ||
            target.classList.contains(Classes.TABLE_INTERACTION_BAR) ||
            target.classList.contains(Classes.TABLE_HEADER_CONTENT)
        );
    }

    public context: ColumnInteractionBarContextTypes = {
        enableColumnInteractionBar: false,
    };

    public state = {
        isActive: false,
    };

    public render() {
        const {
            // from IColumnHeaderCellProps
            enableColumnReordering,
            isColumnSelected,
            menuIcon,

            // from IColumnNameProps
            name,
            nameRenderer,

            // from IHeaderProps
            ...spreadableProps
        } = this.props;

        const classes = classNames(spreadableProps.className, Classes.TABLE_COLUMN_HEADER_CELL, {
            [Classes.TABLE_HAS_INTERACTION_BAR]: this.context.enableColumnInteractionBar,
            [Classes.TABLE_HAS_REORDER_HANDLE]: this.props.reorderHandle != null,
        });

        return (
            <HeaderCell
                isReorderable={this.props.enableColumnReordering}
                isSelected={this.props.isColumnSelected}
                {...spreadableProps}
                className={classes}
            >
                {this.renderName()}
                {this.maybeRenderContent()}
                {this.props.loading ? undefined : this.props.resizeHandle}
            </HeaderCell>
        );
    }

    private renderName() {
        const { index, loading, name, nameRenderer, reorderHandle } = this.props;

        const dropdownMenu = this.maybeRenderDropdownMenu();
        const defaultName = <div className={Classes.TABLE_TRUNCATED_TEXT}>{name}</div>;

        const nameComponent = (
            <LoadableContent loading={loading ?? false} variableLength={true}>
                {nameRenderer?.(name!, index) ?? defaultName}
            </LoadableContent>
        );

        if (this.context.enableColumnInteractionBar) {
            return (
                <div className={Classes.TABLE_COLUMN_NAME} title={name}>
                    <div className={Classes.TABLE_INTERACTION_BAR}>
                        {reorderHandle}
                        {dropdownMenu}
                    </div>
                    <HorizontalCellDivider />
                    <div className={Classes.TABLE_COLUMN_NAME_TEXT}>{nameComponent}</div>
                </div>
            );
        } else {
            return (
                <div className={Classes.TABLE_COLUMN_NAME} title={name}>
                    {reorderHandle}
                    {dropdownMenu}
                    <div className={Classes.TABLE_COLUMN_NAME_TEXT}>{nameComponent}</div>
                </div>
            );
        }
    }

    private maybeRenderContent() {
        if (this.props.children === null) {
            return undefined;
        }

        return <div className={Classes.TABLE_HEADER_CONTENT}>{this.props.children}</div>;
    }

    private maybeRenderDropdownMenu() {
        const { index, menuIcon, menuRenderer } = this.props;

        if (!CoreUtils.isFunction(menuRenderer)) {
            return undefined;
        }

        const classes = classNames(Classes.TABLE_TH_MENU_CONTAINER, CLASSNAME_EXCLUDED_FROM_TEXT_MEASUREMENT, {
            [Classes.TABLE_TH_MENU_OPEN]: this.state.isActive,
        });

        return (
            <div className={classes}>
                <div className={Classes.TABLE_TH_MENU_CONTAINER_BACKGROUND} />
                <Popover2
                    className={Classes.TABLE_TH_MENU}
                    content={menuRenderer(index)}
                    onClosing={this.handlePopoverClosing}
                    onOpened={this.handlePopoverOpened}
                    placement="bottom"
                    rootBoundary="document"
                >
                    <Icon icon={menuIcon} />
                </Popover2>
            </div>
        );
    }

    private handlePopoverOpened = () => this.setState({ isActive: true });

    private handlePopoverClosing = () => this.setState({ isActive: false });
}