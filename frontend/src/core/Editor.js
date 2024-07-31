import React from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';


export function MarkdownEditor({ value, onChange, height=200 })
{
    return (
        <MDEditor
            value={value}
            onChange={onChange}
            preview="edit"
            height={height}
            commands={[
                commands.bold,
                commands.italic,
                commands.link,
                // commands.hr,
                commands.table,
                // commands.code,
                commands.codeBlock,
                commands.divider,
                commands.unorderedListCommand,
                commands.orderedListCommand,
                commands.checkedListCommand,
            ]}
            extraCommands={[
                commands.codeEdit,
                commands.codePreview,
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
            style={{
                whiteSpace: 'pre-wrap',
                padding: '5px 20px 5px 0px'
            }}
            className='md-preview'
        />
    );
}
