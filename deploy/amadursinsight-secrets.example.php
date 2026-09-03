<?php
/**
 * Rename to  amadursinsight-secrets.php  and upload it ONE LEVEL ABOVE
 * public_html (your cPanel home directory) so it is never web-accessible.
 *
 * If your host will not let you place files above the web root, put it in
 * public_html/api/ instead — generate.php checks there last — but then add a
 * rule to public_html/api/.htaccess to deny direct access to this file.
 */
return [
    'api_key'      => 'sk-ant-api03-...',
    'workspace_id' => 'wrkspc_...',   // only if your key is identity-linked; else ''
    'model'        => 'claude-sonnet-5', // or 'claude-opus-5' for slower/higher quality
];
