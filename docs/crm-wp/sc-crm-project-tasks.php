<?php
/**
 * Plugin Name: SC CRM Project Tasks
 * Description: Per-project task list with progress for the Studio Complex CRM.
 *              Adds a "Tareas del proyecto" panel to the project page, with its own
 *              table. Does not modify the studio-complex-crm plugin: delete this file
 *              to roll back (the table is kept).
 *
 * Install as a must-use plugin: wp-content/mu-plugins/sc-crm-project-tasks.php
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const SC_PT_DB_VERSION = '1';

function sc_pt_table(): string {
	global $wpdb;
	return $wpdb->prefix . 'sc_crm_project_tasks';
}

function sc_pt_statuses(): array {
	return array(
		'pending' => 'Pendiente',
		'doing'   => 'En curso',
		'blocked' => 'Bloqueada',
		'done'    => 'Hecha',
	);
}

/**
 * Creates the table once (and again if the version changes).
 */
add_action(
	'admin_init',
	static function (): void {
		if ( get_option( 'sc_pt_db_version' ) === SC_PT_DB_VERSION ) {
			return;
		}
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$table   = sc_pt_table();
		$charset = $wpdb->get_charset_collate();
		dbDelta(
			"CREATE TABLE {$table} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				project_id BIGINT UNSIGNED NOT NULL,
				title VARCHAR(200) NOT NULL DEFAULT '',
				status VARCHAR(20) NOT NULL DEFAULT 'pending',
				due_date DATE NULL,
				assigned_to BIGINT UNSIGNED NOT NULL DEFAULT 0,
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY project_id (project_id),
				KEY status (status)
			) {$charset};"
		);
		update_option( 'sc_pt_db_version', SC_PT_DB_VERSION );
	}
);

function sc_pt_can(): bool {
	return current_user_can( 'manage_options' );
}

/**
 * Writes a line in the project timeline when the CRM plugin is available.
 */
function sc_pt_log( int $project_id, string $text ): void {
	try {
		if ( ! class_exists( '\StudioComplexCRM\Core\Plugin' ) ) {
			return;
		}
		$timeline = \StudioComplexCRM\Core\Plugin::instance()->get_container()->make( \StudioComplexCRM\Modules\Timeline\Services\TimelineService::class );
		$timeline->log( 'project', $project_id, 'note', $text );
	} catch ( \Throwable $e ) {
		// The timeline is a nicety: never block the task action.
		return;
	}
}

function sc_pt_back( int $project_id, string $flag ): void {
	$url = add_query_arg(
		array(
			'page'  => 'sc-crm-projects',
			'view'  => 'view',
			'id'    => $project_id,
			'sc_pt' => $flag,
		),
		admin_url( 'admin.php' )
	);
	wp_safe_redirect( $url );
	exit;
}

function sc_pt_guard( int $project_id, string $nonce_action ): void {
	if ( $project_id <= 0 || ! sc_pt_can() || ! check_admin_referer( $nonce_action ) ) {
		wp_die( esc_html__( 'No autorizado.', 'sc-crm' ) );
	}
}

add_action(
	'admin_post_sc_pt_add',
	static function (): void {
		global $wpdb;
		$project_id = isset( $_POST['project_id'] ) ? absint( $_POST['project_id'] ) : 0;
		sc_pt_guard( $project_id, 'sc_pt_add_' . $project_id );

		$title = mb_substr( sanitize_text_field( wp_unslash( $_POST['title'] ?? '' ) ), 0, 200 );
		if ( '' === $title ) {
			sc_pt_back( $project_id, 'empty' );
		}
		$due = sanitize_text_field( wp_unslash( $_POST['due_date'] ?? '' ) );
		$due = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $due ) ? $due : null;
		$now = current_time( 'mysql' );

		$wpdb->insert(
			sc_pt_table(),
			array(
				'project_id'  => $project_id,
				'title'       => $title,
				'status'      => 'pending',
				'due_date'    => $due,
				'assigned_to' => absint( $_POST['assigned_to'] ?? 0 ),
				'created_at'  => $now,
				'updated_at'  => $now,
			)
		);
		sc_pt_back( $project_id, 'added' );
	}
);

add_action(
	'admin_post_sc_pt_status',
	static function (): void {
		global $wpdb;
		$project_id = isset( $_POST['project_id'] ) ? absint( $_POST['project_id'] ) : 0;
		$task_id    = isset( $_POST['task_id'] ) ? absint( $_POST['task_id'] ) : 0;
		sc_pt_guard( $project_id, 'sc_pt_status_' . $task_id );

		$status = sanitize_key( wp_unslash( $_POST['status'] ?? '' ) );
		if ( ! array_key_exists( $status, sc_pt_statuses() ) ) {
			sc_pt_back( $project_id, 'invalid' );
		}
		$table = sc_pt_table();
		$task  = $wpdb->get_row( $wpdb->prepare( "SELECT title, status FROM {$table} WHERE id = %d AND project_id = %d", $task_id, $project_id ) );
		if ( ! $task ) {
			sc_pt_back( $project_id, 'invalid' );
		}
		$wpdb->update(
			$table,
			array(
				'status'     => $status,
				'updated_at' => current_time( 'mysql' ),
			),
			array(
				'id'         => $task_id,
				'project_id' => $project_id,
			)
		);
		if ( 'done' === $status && 'done' !== $task->status ) {
			sc_pt_log( $project_id, 'Tarea completada: ' . $task->title );
		}
		sc_pt_back( $project_id, 'updated' );
	}
);

add_action(
	'admin_post_sc_pt_delete',
	static function (): void {
		global $wpdb;
		$project_id = isset( $_POST['project_id'] ) ? absint( $_POST['project_id'] ) : 0;
		$task_id    = isset( $_POST['task_id'] ) ? absint( $_POST['task_id'] ) : 0;
		sc_pt_guard( $project_id, 'sc_pt_delete_' . $task_id );

		$wpdb->delete(
			sc_pt_table(),
			array(
				'id'         => $task_id,
				'project_id' => $project_id,
			)
		);
		sc_pt_back( $project_id, 'deleted' );
	}
);

/**
 * Renders the panel in the admin footer of the project page and moves it into
 * place with JS (before "Archivos"); without a match it stays at the end of the app.
 */
add_action(
	'admin_footer',
	static function (): void {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only routing params.
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
		$view = isset( $_GET['view'] ) ? sanitize_key( wp_unslash( $_GET['view'] ) ) : '';
		$id   = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;
		$flag = isset( $_GET['sc_pt'] ) ? sanitize_key( wp_unslash( $_GET['sc_pt'] ) ) : '';
		// phpcs:enable
		if ( 'sc-crm-projects' !== $page || 'view' !== $view || $id <= 0 || ! sc_pt_can() ) {
			return;
		}

		global $wpdb;
		$table = sc_pt_table();
		$tasks = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE project_id = %d ORDER BY FIELD(status,'blocked','doing','pending','done'), due_date IS NULL, due_date ASC, id ASC", $id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$tasks = is_array( $tasks ) ? $tasks : array();

		$total   = count( $tasks );
		$done    = count( array_filter( $tasks, static fn( $t ): bool => 'done' === $t->status ) );
		$blocked = count( array_filter( $tasks, static fn( $t ): bool => 'blocked' === $t->status ) );
		$percent = $total > 0 ? (int) round( $done * 100 / $total ) : 0;
		$labels  = sc_pt_statuses();
		$users   = get_users( array( 'capability' => 'manage_options' ) );
		$action  = admin_url( 'admin-post.php' );
		$today   = current_time( 'Y-m-d' );

		$messages = array(
			'added'   => 'Tarea agregada.',
			'updated' => 'Tarea actualizada.',
			'deleted' => 'Tarea eliminada.',
			'empty'   => 'Escribí un título para la tarea.',
			'invalid' => 'No se pudo actualizar la tarea.',
		);
		?>
<div id="sc-pt-panel" class="sc-crm-form">
	<style>
		#sc-pt-panel .sc-pt-bar{height:10px;border-radius:999px;background:#e6e8ee;overflow:hidden;margin:6px 0 10px}
		#sc-pt-panel .sc-pt-bar span{display:block;height:100%;background:#e8590c;border-radius:999px}
		#sc-pt-panel .sc-pt-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
		#sc-pt-panel .sc-pt-add{display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin:12px 0}
		#sc-pt-panel .sc-pt-add input,#sc-pt-panel .sc-pt-add select,#sc-pt-panel select.sc-pt-st{width:100%;padding:8px 10px;border:1px solid #d5d9e2;border-radius:10px;background:#fff}
		#sc-pt-panel ul.sc-pt-list{list-style:none;margin:0;padding:0}
		#sc-pt-panel li.sc-pt-item{display:grid;grid-template-columns:1fr auto auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid #eceef3}
		#sc-pt-panel .sc-pt-title.is-done{text-decoration:line-through;color:#8a90a0}
		#sc-pt-panel .sc-pt-meta{font-size:12px;color:#6b7280}
		#sc-pt-panel .sc-pt-late{color:#c92a2a;font-weight:600}
		#sc-pt-panel .sc-pt-del{background:none;border:0;color:#c92a2a;cursor:pointer;font-size:12px}
		@media (max-width:782px){#sc-pt-panel .sc-pt-add{grid-template-columns:1fr}#sc-pt-panel li.sc-pt-item{grid-template-columns:1fr}}
	</style>
	<h2>Tareas del proyecto</h2>
		<?php if ( isset( $messages[ $flag ] ) ) : ?>
		<p class="sc-crm-banner<?php echo in_array( $flag, array( 'empty', 'invalid' ), true ) ? ' error' : ''; ?>"><?php echo esc_html( $messages[ $flag ] ); ?></p>
		<?php endif; ?>

	<p class="sc-pt-meta" style="margin:0">Avance: <?php echo esc_html( (string) $done ); ?> de <?php echo esc_html( (string) $total ); ?> tareas (<?php echo esc_html( (string) $percent ); ?>%)</p>
	<div class="sc-pt-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="<?php echo esc_attr( (string) $percent ); ?>"><span style="width:<?php echo esc_attr( (string) $percent ); ?>%"></span></div>
		<?php if ( $blocked > 0 ) : ?>
	<div class="sc-pt-chips"><span class="pill danger"><?php echo esc_html( (string) $blocked ); ?> bloqueada<?php echo 1 === $blocked ? '' : 's'; ?></span></div>
		<?php endif; ?>

	<form method="post" action="<?php echo esc_url( $action ); ?>" class="sc-pt-add">
		<input type="hidden" name="action" value="sc_pt_add" />
		<input type="hidden" name="project_id" value="<?php echo esc_attr( (string) $id ); ?>" />
		<?php wp_nonce_field( 'sc_pt_add_' . $id ); ?>
		<input type="text" name="title" maxlength="200" placeholder="Nueva tarea (ej.: Cargar productos)" required />
		<input type="date" name="due_date" aria-label="Fecha límite" />
		<select name="assigned_to" aria-label="Responsable">
			<option value="0">Sin responsable</option>
			<?php foreach ( $users as $u ) : ?>
				<option value="<?php echo esc_attr( (string) $u->ID ); ?>"><?php echo esc_html( $u->display_name ); ?></option>
			<?php endforeach; ?>
		</select>
		<button type="submit" class="btn">Agregar</button>
	</form>

		<?php if ( 0 === $total ) : ?>
	<p class="sc-crm-empty">Todavía no hay tareas. Sumá la primera arriba.</p>
		<?php else : ?>
	<ul class="sc-pt-list">
			<?php foreach ( $tasks as $t ) : ?>
				<?php
				$late     = null !== $t->due_date && 'done' !== $t->status && $t->due_date < $today;
				$assignee = (int) $t->assigned_to > 0 ? get_userdata( (int) $t->assigned_to ) : false;
				?>
		<li class="sc-pt-item">
			<div>
				<div class="sc-pt-title<?php echo 'done' === $t->status ? ' is-done' : ''; ?>"><?php echo esc_html( $t->title ); ?></div>
				<div class="sc-pt-meta">
					<?php echo $assignee ? esc_html( $assignee->display_name ) : 'Sin responsable'; ?>
					<?php if ( null !== $t->due_date ) : ?>
						· <span class="<?php echo $late ? 'sc-pt-late' : ''; ?>"><?php echo $late ? 'Vencida: ' : 'Para el '; ?><?php echo esc_html( mysql2date( 'j M Y', $t->due_date ) ); ?></span>
					<?php endif; ?>
				</div>
			</div>
			<form method="post" action="<?php echo esc_url( $action ); ?>">
				<input type="hidden" name="action" value="sc_pt_status" />
				<input type="hidden" name="project_id" value="<?php echo esc_attr( (string) $id ); ?>" />
				<input type="hidden" name="task_id" value="<?php echo esc_attr( (string) $t->id ); ?>" />
				<?php wp_nonce_field( 'sc_pt_status_' . $t->id ); ?>
				<select name="status" class="sc-pt-st" aria-label="Estado" onchange="this.form.submit()">
					<?php foreach ( $labels as $key => $label ) : ?>
						<option value="<?php echo esc_attr( $key ); ?>"<?php selected( $t->status, $key ); ?>><?php echo esc_html( $label ); ?></option>
					<?php endforeach; ?>
				</select>
			</form>
			<span></span>
			<form method="post" action="<?php echo esc_url( $action ); ?>" onsubmit="return confirm('¿Eliminar esta tarea?');">
				<input type="hidden" name="action" value="sc_pt_delete" />
				<input type="hidden" name="project_id" value="<?php echo esc_attr( (string) $id ); ?>" />
				<input type="hidden" name="task_id" value="<?php echo esc_attr( (string) $t->id ); ?>" />
				<?php wp_nonce_field( 'sc_pt_delete_' . $t->id ); ?>
				<button type="submit" class="sc-pt-del">Eliminar</button>
			</form>
		</li>
			<?php endforeach; ?>
	</ul>
		<?php endif; ?>
</div>
<script>
(function () {
	var panel = document.getElementById('sc-pt-panel');
	if (!panel) { return; }
	var files = document.querySelector('.sc-crm-project-main .sc-crm-files');
	if (files && files.parentNode) {
		files.parentNode.insertBefore(panel, files);
		return;
	}
	var app = document.getElementById('sc-crm-app');
	if (app) { app.appendChild(panel); }
})();
</script>
		<?php
	}
);
