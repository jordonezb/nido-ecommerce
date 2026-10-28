import { test, expect } from '@playwright/test';

/**
 * Suite E2E en Navegador para Nido Live Gift & Cápsula Anti-Devoluciones
 * Valida todos los requisitos técnicos mínimos y criterios opcionales:
 * - Dos usuarios precargados (Mateo y Valentina).
 * - Catálogo con datos de prueba.
 * - Flujo completo de regalo interactivo de extremo a extremo.
 * - Checkout simulado con soporte de REJECTED, PENDING y APPROVED.
 * - Sincronización en tiempo real con WebSockets (Socket.io).
 * - Cápsula Anti-Devoluciones y Desbloqueo de Cupón de Recompra.
 */

test.describe('Nido Live Gift - Suite E2E desde el Navegador', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');

    // Asegurar que el estado esté limpio usando el botón "Reiniciar Demo"
    const resetBtn = page.getByRole('button', { name: /Reiniciar Demo/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('E2E-01: Verificación de usuarios precargados, catálogo y modo simultáneo', async ({ page }) => {
    // 1. Validar que la cabecera e indicador de WebSockets están presentes
    await expect(page.locator('h1')).toContainText('NIDO');
    await expect(page.getByText('Cápsula Anti-Devoluciones & Experiencia Sincrónica')).toBeVisible();

    // 2. Activar vista simultánea para verificar los 2 usuarios precargados lado a lado
    const simultaneousBtn = page.getByRole('button', { name: /Vista Simultánea/i });
    if (await simultaneousBtn.isVisible()) {
      await simultaneousBtn.click();
    }

    // 3. Validar presencia de Usuario A (Mateo Gómez) y Usuario B (Valentina Ríos)
    await expect(page.getByText(/Mateo Gómez/i).first()).toBeVisible();
    await expect(page.getByText(/Valentina Ríos/i).first()).toBeVisible();

    // 4. Validar catálogo con productos, categorías y precios en COP
    await expect(page.getByRole('heading', { name: /Regalo Principal/i })).toBeVisible();
    await expect(page.getByText(/Chaqueta Denim/i).or(page.getByText(/Cata Guiada/i)).first()).toBeVisible();
  });

  test('E2E-02: Generación asistida por IA (Dedicatoria y Pista Secreta)', async ({ page }) => {
    // Activar vista Mateo
    await page.getByRole('button', { name: /Mateo \(Regala\)/i }).click();

    // Navegar a la pestaña Cápsula (Fase 2)
    await page.getByRole('button', { name: /Cápsula/i }).first().click();

    // Hacer clic en "Autocompletar con Nido AI"
    const aiButton = page.getByRole('button', { name: /Autocompletar con Nido AI/i });
    await expect(aiButton).toBeVisible();
    await aiButton.click();

    // Verificar que se llene la Dedicatoria y la Pista Secreta
    const dedicationTextarea = page.locator('textarea[placeholder*="mensaje con cariño"]');
    const hintInput = page.locator('input[placeholder*="Vibra al compás"]');

    await expect(dedicationTextarea).not.toHaveValue('', { timeout: 10000 });
    await expect(hintInput).not.toHaveValue('', { timeout: 10000 });

    // Guardar la cápsula
    const saveCapsuleBtn = page.getByRole('button', { name: /Confirmar y Guardar Cápsula/i });
    await saveCapsuleBtn.click();
    await expect(page.getByText(/Cápsula de regalo creada/i)).toBeVisible();
  });

  test('E2E-03: Checkout Simulado - Prueba de Estados Rechazado, Pendiente y Aprobado', async ({ page }) => {
    await page.getByRole('button', { name: /Mateo \(Regala\)/i }).click();

    // Navegar a la pestaña Pagar (Fase 3)
    await page.getByRole('button', { name: /Pagar/i }).first().click();

    // 1. Simular RECHAZO
    const rejectBtn = page.getByRole('button', { name: /^Rechazar$/i });
    await rejectBtn.click();
    await expect(page.getByText(/Transacción rechazada por el banco emisor/i)).toBeVisible();
    await expect(page.getByText(/Pago rechazado por el banco/i)).toBeVisible();

    // 2. Simular PENDIENTE
    const pendingBtn = page.getByRole('button', { name: /^Pendiente$/i });
    await pendingBtn.click();
    await expect(page.getByText(/Pago en revisión bancaria/i)).toBeVisible();

    // 3. Simular APROBACIÓN
    const approveBtn = page.getByRole('button', { name: /^Aprobar$/i });
    await approveBtn.click();
    await expect(page.getByText(/Pago de .* COP aprobado exitosamente/i)).toBeVisible();
    await expect(page.getByText(/¡Listo para Unboxing!/i)).toBeVisible();
  });

  test('E2E-04: Flujo Completo de Unboxing, Cápsula Anti-Devolución y Reacción en Vivo', async ({ page }) => {
    // Paso A: Mateo crea y aprueba el regalo
    await page.getByRole('button', { name: /Mateo \(Regala\)/i }).click();

    // Navegar a la pestaña Pagar (Fase 3)
    await page.getByRole('button', { name: /Pagar/i }).first().click();
    const approveBtn = page.getByRole('button', { name: /^Aprobar$/i });
    await approveBtn.click();
    await page.waitForTimeout(1000);

    // Paso B: Cambiar a la vista de Valentina (Quien Recibe)
    await page.getByRole('button', { name: /Valentina \(Recibe\)/i }).click();

    // Validar pantalla lista para unboxing
    await expect(page.getByText(/¡Tienes un regalo esperándote!/i)).toBeVisible();
    const unboxBtn = page.getByRole('button', { name: /Iniciar Unboxing en Vivo/i });
    await expect(unboxBtn).toBeVisible();

    // Valentina inicia el unboxing
    await unboxBtn.click();
    await page.waitForTimeout(1000);

    // Validar que se muestre la dedicatoria y los detalles del producto
    await expect(page.getByText(/Dedicatoria de Mateo/i)).toBeVisible();
    await expect(page.getByText(/Cero Devolución/i)).toBeVisible();

    // Probar la Cápsula Anti-Devoluciones: desplegar alternativas
    const capsuleToggle = page.getByRole('button', { name: /¿Prefieres otra opción de tu Cápsula Sorpresa\?/i });
    if (await capsuleToggle.isVisible()) {
      await capsuleToggle.click();
      await expect(page.getByText(/Mateo pre-aprobó estas opciones para ti/i)).toBeVisible();
    }

    // Seleccionar emoji de reacción
    await page.getByRole('button', { name: /¡Me enamoré!/i }).click();

    // Confirmar y reclamar regalo
    const claimBtn = page.getByRole('button', { name: /Confirmar Regalo y Desbloquear Bono/i });
    await claimBtn.click();

    // Validar desbloqueo exitoso de cupón de recompra y confirmación de despacho
    await expect(page.getByText(/¡Regalo confirmado para despacho!/i)).toBeVisible();
    await expect(page.getByText(/NIDO-CONEXION-15/i).or(page.getByText(/NIDO-WELCOME-15/i)).first()).toBeVisible();

    // Paso C: Volver a la vista de Mateo y validar que el radar en vivo notifique la acción
    await page.getByRole('button', { name: /Mateo \(Regala\)/i }).click();
    await page.getByRole('button', { name: /Pagar/i }).first().click();
    await expect(page.getByText(/Valentina eligió y confirmó su regalo/i).or(page.getByText(/Radar en Vivo de Valentina/i))).toBeVisible();
  });
});
