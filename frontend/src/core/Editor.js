import React from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';


export function MarkdownEditor({ value, onChange, height=200, placeholder='' })
{
    return (
        <MDEditor
            value={value}
            onChange={onChange}
            preview="edit"
            height={height}
            placeholder={placeholder}
            commands={[
                commands.bold,
                commands.link,
                commands.table,
                commands.codeBlock,
                commands.unorderedListCommand,
                commands.orderedListCommand,
                commands.checkedListCommand,
            ]}
            extraCommands={[
                commands.codeEdit,
                commands.divider,
                commands.codePreview,
                commands.divider,
                commands.fullscreen,
            ]}
        />
    );
}


export function MarkdownPreview({ source })
{
    return (
        <MDEditor.Markdown
            source={source}
            className='md-preview'
        />
    );
}
