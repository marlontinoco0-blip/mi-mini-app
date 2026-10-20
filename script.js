
console.log("JavaScript de tareas cargadndo");

const lista = document.querySelector("#lista-tareas");

const botonesNavegacion = document.querySelectorAll(".nav-boton");

const pantallaDia = document.querySelector("#pantalla-dia");
const pantallaNueva = document.querySelector("#pantalla-nueva");
const pantallaProgreso = document.querySelector("#pantalla-progreso");
const pantallaPerfil = document.querySelector("#pantalla-perfil");
const pantallaBienvenida = document.querySelector("#pantalla-bienvenida");
const pantallaLogin = document.querySelector("#pantalla-login");
const historialPantallas = [];
const botonAtras = document.querySelector("#boton-atras");

botonesNavegacion.forEach(function (boton) {
    if (boton.id === "boton-atras") return;

    boton.addEventListener("click", function () {
        const pantalla = boton.dataset.pantalla;
        console.log("pantalla seleccionada:", pantalla);
        console.log("elemento de perfil:", pantallaPerfil)

        const pantallaActual =
            !pantallaLogin.hidden ? "login" :
            !pantallaBienvenida.hidden ? "bienvenida" :
            !pantallaDia.hidden ? "dia" :
            !pantallaNueva.hidden ? "nueva" :
            !pantallaProgreso.hidden ? "progreso" :
            "perfil";

        historialPantallas.push(pantallaActual);

        pantallaLogin.hidden = true;
        pantallaBienvenida.hidden = true;
        pantallaDia.hidden = pantalla !== "dia";
        pantallaNueva.hidden = pantalla !== "nueva";
        pantallaProgreso.hidden = pantalla !== "progreso";
        pantallaPerfil.hidden = pantalla !== "perfil";

        botonesNavegacion.forEach(function (otroBoton) {
            otroBoton.classList.remove("activo");
        });

        boton.classList.add("activo");
        window.scrollTo(0, 0);
    });
});
/* ===== BOTÓN VOLVER ATRÁS ===== */

if (botonAtras) {
    botonAtras.addEventListener("click", function () {
        const pantallaAnterior = historialPantallas.pop();

        // Si no hay historial, regresar a la bienvenida.
        const destino = pantallaAnterior || "bienvenida";

        pantallaLogin.hidden = destino !== "login";
        pantallaBienvenida.hidden = destino !== "bienvenida";
        pantallaDia.hidden = destino !== "dia";
        pantallaNueva.hidden = destino !== "nueva";
        pantallaProgreso.hidden = destino !== "progreso";
        pantallaPerfil.hidden = destino !== "perfil";

        // Actualizar el botón activo de navegación.
        botonesNavegacion.forEach(function (boton) {
            boton.classList.toggle(
                "activo",
                boton.dataset.pantalla === destino
            );
        });

        window.scrollTo(0, 0);
    });
}

const botonComenzar = document.querySelector("#boton-comenzar");


botonComenzar.addEventListener("click", function () {
    historialPantallas.push("dia");

    pantallaBienvenida.hidden = true;
    pantallaDia.hidden = true;
    pantallaNueva.hidden = false;
    pantallaProgreso.hidden = true;

    botonesNavegacion.forEach(function (boton) {
        boton.classList.toggle(
            "activo",
            boton.dataset.pantalla === "nueva"
        );
    });
});

const contadorPendientes = document.querySelector("#contador-pendientes");
const contadorCompletadas = document.querySelector("#contador-completadas");

function actualizarContadores() {
    const tareas = Array.from(lista.querySelectorAll("li"));
    const completadas = tareas.filter(tarea =>
        tarea.classList.contains("completada")
    );

    const pendientes = tareas.length - completadas.length;

    contadorPendientes.textContent = pendientes;
    contadorCompletadas.textContent = completadas.length;

    const porcentaje = tareas.length === 0
        ? 0
        : Math.round((completadas.length / tareas.length) * 100);

    const textoPorcentaje = document.querySelector("#porcentaje-progreso");
    const barraProgreso = document.querySelector("#barra-progreso-valor");

    if (textoPorcentaje && barraProgreso) {
        textoPorcentaje.textContent = porcentaje + "%";
        barraProgreso.style.width = porcentaje + "%";
    }

    // Estadísticas por prioridad
    const total = document.querySelector("#estadistica-total");
    const alta = document.querySelector("#estadistica-alta");
    const media = document.querySelector("#estadistica-media");
    const baja = document.querySelector("#estadistica-baja");

    if (total) total.textContent = tareas.length;

    if (alta) {
        alta.textContent = tareas.filter(t =>
            t.dataset.prioridad === "alta"
        ).length;
    }

    if (media) {
        media.textContent = tareas.filter(t =>
            t.dataset.prioridad === "media"
        ).length;
    }

    if (baja) {
        baja.textContent = tareas.filter(t =>
            t.dataset.prioridad === "baja"
        ).length;
    }

    // Gráfico de tareas pendientes y completadas
    const graficoPendientes = document.querySelector("#grafico-pendientes");
    const graficoCompletadas = document.querySelector("#grafico-completadas");
    const numeroPendientes = document.querySelector("#grafico-pendientes-numero");
    const numeroCompletadas = document.querySelector("#grafico-completadas-numero");

    const porcentajePendientes = tareas.length === 0
        ? 0
        : (pendientes / tareas.length) * 100;

    const porcentajeCompletadas = tareas.length === 0
        ? 0
        : (completadas.length / tareas.length) * 100;

    if (graficoPendientes) {
        graficoPendientes.style.width = porcentajePendientes + "%";
    }

    if (graficoCompletadas) {
        graficoCompletadas.style.width = porcentajeCompletadas + "%";
    }

    if (numeroPendientes) {
        numeroPendientes.textContent = pendientes;
    }

    if (numeroCompletadas) {
        numeroCompletadas.textContent = completadas.length;
    }
}

function actualizarAvisosVencimiento() {
    const tareas = lista.querySelectorAll("li");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    tareas.forEach(function (tarea) {
        // Eliminar avisos de texto anteriores
        const aviso = tarea.querySelector(".aviso-vencimiento");

        if (aviso) {
            aviso.remove();
        }

        // Limpiar los estados visuales anteriores
        tarea.classList.remove(
            "tarea-vencida",
            "tarea-vence-hoy",
            "tarea-vence-pronto"
        );

        const fecha = tarea.dataset.fecha;

        // Las tareas completadas o sin fecha no llevan alerta
        if (!fecha || tarea.classList.contains("completada")) {
            return;
        }

        const fechaLimite = new Date(fecha + "T00:00:00");

        if (Number.isNaN(fechaLimite.getTime())) {
            return;
        }

        const diasRestantes = Math.round(
            (fechaLimite - hoy) / 86400000
        );

        if (diasRestantes < 0) {
            tarea.classList.add("tarea-vencida");
        } else if (diasRestantes === 0) {
            tarea.classList.add("tarea-vence-hoy");
        } else if (diasRestantes <= 3) {
            tarea.classList.add("tarea-vence-pronto");
        }
    });

    ordenarTareas();
}

function ordenarTareas() {
    const tareas = Array.from(lista.querySelectorAll("li"));

    const prioridadOrden = {
        alta: 0,
        media: 1,
        baja: 2
    };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    function obtenerGrupo(tarea) {
        if (tarea.classList.contains("completada")) {
            return 4;
        }

        const fecha = tarea.dataset.fecha;

        if (!fecha) {
            return 3;
        }

        const limite = new Date(fecha + "T00:00:00");

        if (Number.isNaN(limite.getTime())) {
            return 3;
        }

        const dias = Math.round(
            (limite - hoy) / 86400000
        );

        if (dias < 0) return 0;
        if (dias === 0) return 1;
        if (dias <= 3) return 2;

        return 3;
    }

    tareas.sort(function (a, b) {
        // Primero se ordena por urgencia
        const diferenciaGrupo =
            obtenerGrupo(a) - obtenerGrupo(b);

        if (diferenciaGrupo !== 0) {
            return diferenciaGrupo;
        }

        // Dentro de cada grupo: alta, media y baja
        const prioridadA =
            prioridadOrden[a.dataset.prioridad] ?? 1;

        const prioridadB =
            prioridadOrden[b.dataset.prioridad] ?? 1;

        if (prioridadA !== prioridadB) {
            return prioridadA - prioridadB;
        }

        // Si coinciden, mostrar primero la fecha más próxima
        const fechaA = a.dataset.fecha
            ? new Date(a.dataset.fecha + "T00:00:00").getTime()
            : Infinity;

        const fechaB = b.dataset.fecha
            ? new Date(b.dataset.fecha + "T00:00:00").getTime()
            : Infinity;

        return fechaA - fechaB;
    });

    // Reordenar las tarjetas sin recrearlas
    tareas.forEach(function (tarea) {
        lista.appendChild(tarea);
    });
}

const entradaNueva = document.querySelector("#entrada-nueva");
const prioridadTarea = document.querySelector("#prioridad-tarea");
const botonCrear = document.querySelector("#boton-crear");
const fechaTarea = document.querySelector("#fecha-tarea");

botonCrear.addEventListener("click",

     function () {
    const texto = entradaNueva.value.trim();

    if (texto === "") {
        alert("Escribe una tarea antes de crearla.");
        entradaNueva.focus();
        return;
    }

    const tarea = document.createElement("li");
tarea.classList.add("tarea-item");

const nombreTarea = document.createElement("span");
nombreTarea.textContent = texto;

const prioridad = document.createElement("span");
const nivel = prioridadTarea.value;

prioridad.textContent = nivel.toUpperCase();
prioridad.classList.add("etiqueta-prioridad", nivel);

tarea.dataset.prioridad = nivel;
const fecha = fechaTarea.value;
tarea.appendChild(nombreTarea);

if (fecha !== "") {
    tarea.dataset.fecha = fecha;

    const fechaTexto = document.createElement("span");
    fechaTexto.classList.add("fecha-tarea");
    fechaTexto.textContent = "🗓️ " + fecha.split("-").reverse().join("/");
    tarea.appendChild(fechaTexto);
}

tarea.appendChild(nombreTarea);
tarea.appendChild(prioridad);


    lista.appendChild(tarea);
    activarTarea(tarea);
    actualizarContadores();
    actualizarAvisosVencimiento();
    guardarTareas();

    entradaNueva.value = "";
    fechaTarea.value = "";
    entradaNueva.focus();
});

function guardarTareas() {
    localStorage.setItem("misTareas", lista.innerHTML);
}

function activarTarea(tarea) {
    tarea.addEventListener("click",

         function (evento) {
        if (evento.target.closest(".boton-eliminar")) {
            return;
        }

        tarea.classList.toggle("completada");
        actualizarContadores();
        actualizarAvisosVencimiento();
        guardarTareas();
    });

    let botonEliminar = tarea.querySelector(".boton-eliminar");

    if (!botonEliminar) {
        botonEliminar = document.createElement("button");
        botonEliminar.textContent = "🗑️";
        botonEliminar.className = "boton-eliminar";
        botonEliminar.type = "button";
        botonEliminar.setAttribute("aria-label", "Eliminar tarea");

        tarea.appendChild(botonEliminar);
    }

    botonEliminar.addEventListener("click",

         function (evento) {
        evento.stopPropagation();

        if (confirm("¿Seguro que quieres eliminar esta tarea?")) {
            tarea.remove();
            guardarTareas();
            actualizarContadores();
        }
    });
}
function cargarTareas() {
    const tareasGuardadas = localStorage.getItem("misTareas");

    if (tareasGuardadas !== null) {
        lista.innerHTML = tareasGuardadas;
    }

    lista.querySelectorAll("li").forEach(function (tarea) {
        activarTarea(tarea)
        });
    

    actualizarContadores();
}

cargarTareas();
actualizarAvisosVencimiento();
const botonIniciar = document.querySelector("#boton-iniciar");

if (botonIniciar && pantallaBienvenida && pantallaDia) {
    botonIniciar.addEventListener("click", function () {
        pantallaBienvenida.hidden = true;
        pantallaDia.hidden = false;
    });
}


/* ===== Navegación del login de prueba ===== */

const formularioLogin = document.querySelector("#formulario-login");
const botonGoogle = document.querySelector("#boton-google");/* ===== CERRAR SESIÓN ===== */

const botonCerrarSesion = document.querySelector("#boton-cerrar-sesion");

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", function () {
        const confirmar = window.confirm("¿Seguro que deseas cerrar sesión?");

        if (!confirmar) return;

        // Eliminar solamente la sesión activa.
        localStorage.removeItem("sesionPrueba");

        // Ocultar las pantallas de la aplicación.
        pantallaBienvenida.hidden = true;
        pantallaDia.hidden = true;
        pantallaNueva.hidden = true;
        pantallaProgreso.hidden = true;
        pantallaPerfil.hidden = true;

        // Mostrar el inicio de sesión.
        pantallaLogin.hidden = false;

        // Limpiar el formulario.
        if (formularioLogin) {
            formularioLogin.reset();
        }

        // Reiniciar la navegación.
        historialPantallas.length = 0;

        botonesNavegacion.forEach(function (boton) {
            boton.classList.remove("activo");
        });

        window.scrollTo(0, 0);
    });
}


function entrarModoPrueba() {
    // Ocultar todas las pantallas
    pantallaLogin.hidden = true;
    pantallaBienvenida.hidden = true;
    pantallaDia.hidden = true;
    pantallaNueva.hidden = true;
    pantallaProgreso.hidden = true;

    // Limpiar los campos del formulario
    if (formularioLogin) {
        formularioLogin.reset();
    }

    // Reiniciar el historial
    historialPantallas.length = 0;

    // Quitar los botones activos
    botonesNavegacion.forEach(function (boton) {
        boton.classList.remove("activo");
    });

    // Mostrar solamente la bienvenida
    pantallaBienvenida.hidden = false;

    // Volver al inicio de la página
    window.scrollTo(0, 0);
}

/* ===== INICIO DE SESIÓN CON CUENTAS LOCALES ===== */

if (formularioLogin) {
    formularioLogin.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const correo = document
            .querySelector("#login-correo")
            .value.trim()
            .toLowerCase();

        const contrasena = document
            .querySelector("#login-contrasena")
            .value;

        if (!correo || !contrasena) {
            alert("Escribe tu correo y contraseña.");
            return;
        }

        const usuarios = JSON.parse(
            localStorage.getItem("usuariosPrueba") || "[]"
        );

        const usuario = usuarios.find(function (elemento) {
            return elemento.correo === correo;
        });

        if (!usuario) {
            alert("No existe una cuenta con ese correo. Regístrate primero.");
            return;
        }

        if (!window.crypto || !window.crypto.subtle) {
            alert("No se puede verificar la contraseña en este navegador. Abre la aplicación con Live Server.");
            return;
        }

        const datos = new TextEncoder().encode(contrasena);
        const resultado = await crypto.subtle.digest("SHA-256", datos);

        const hashIngresado = Array.from(new Uint8Array(resultado))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        if (hashIngresado !== usuario.hash) {
            alert("La contraseña es incorrecta.");
            return;
        }

        // Guardar los datos del usuario que inició sesión.
        localStorage.setItem("sesionPrueba", JSON.stringify({
            nombre: usuario.nombre,
            correo: usuario.correo,
            foto: usuario.foto || null
        }));

        entrarModoPrueba();
    });
}

// Acceso visual de prueba con Google
if (botonGoogle) {
    botonGoogle.addEventListener("click", function () {
        entrarModoPrueba();
    });
}
/* ===== NAVEGACIÓN DEL REGISTRO ===== */

const pantallaRegistro = document.querySelector("#pantalla-registro");
const botonIrRegistro = document.querySelector("#boton-ir-registro");
const botonVolverLogin = document.querySelector("#boton-volver-login");

if (botonIrRegistro) {
    botonIrRegistro.addEventListener("click", function () {
        pantallaLogin.hidden = true;
        pantallaRegistro.hidden = false;
        window.scrollTo(0, 0);
    });
}

if (botonVolverLogin) {
    botonVolverLogin.addEventListener("click", function () {
        pantallaRegistro.hidden = true;
        pantallaLogin.hidden = false;
        window.scrollTo(0, 0);
    });
}
/* ===== REGISTRO LOCAL DE PRUEBA ===== */

const formularioRegistro = document.querySelector("#formulario-registro");

if (formularioRegistro) {
    formularioRegistro.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const nombre = document.querySelector("#registro-nombre").value.trim();
        const correo = document.querySelector("#registro-correo").value.trim().toLowerCase();
        const contrasena = document.querySelector("#registro-contrasena").value;
        const confirmar = document.querySelector("#registro-confirmar").value;

        if (!nombre || !correo || !contrasena || !confirmar) {
            alert("Completa todos los campos.");
            return;
        }

        if (contrasena.length < 8) {
            alert("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (contrasena !== confirmar) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const usuarios = JSON.parse(
            localStorage.getItem("usuariosPrueba") || "[]"
        );

        const correoExiste = usuarios.some(function (usuario) {
            return usuario.correo === correo;
        });

        if (correoExiste) {
            alert("Ya existe una cuenta con ese correo.");
            return;
        }

        // Generar un hash de la contraseña con SHA-256.
        // Solo para pruebas locales; no sustituye la autenticación de Firebase.
        if (!window.crypto || !window.crypto.subtle) {
            alert("El navegador no permite crear la cuenta en este contexto. Abre la app con Live Server y vuelve a intentarlo.");
            return;
        }

        const datos = new TextEncoder().encode(contrasena);
        const resultado = await crypto.subtle.digest("SHA-256", datos);

        const hash = Array.from(new Uint8Array(resultado))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        usuarios.push({
            nombre: nombre,
            correo: correo,
            hash: hash
        });

        localStorage.setItem("usuariosPrueba", JSON.stringify(usuarios));

        alert("Cuenta creada correctamente. Ahora puedes iniciar sesión.");

        formularioRegistro.reset();
        pantallaRegistro.hidden = true;
        pantallaLogin.hidden = false;

        document.querySelector("#login-correo").value = correo;
        document.querySelector("#login-contrasena").focus();

        window.scrollTo(0, 0);
    });
}
/* ===== CARGAR DATOS DEL USUARIO EN MI PERFIL ===== */

const perfilNombre = document.querySelector("#perfil-nombre");
const perfilCorreo = document.querySelector("#perfil-correo");
const botonGuardarPerfil = document.querySelector("#boton-guardar-perfil");

function cargarDatosPerfil() {
    const sesion = JSON.parse(
        localStorage.getItem("sesionPrueba") || "null"
    );

    if (!sesion) {
        perfilNombre.value = "";
        perfilCorreo.value = "";
        perfilCorreo.readOnly = false;
        return;
    }

    perfilNombre.value = sesion.nombre || "";
    perfilCorreo.value = sesion.correo || "";
    perfilCorreo.readOnly = true;
}

// Cargar los datos cada vez que se abre Mi perfil.
botonesNavegacion.forEach(function (boton) {
    if (boton.dataset.pantalla === "perfil") {
        boton.addEventListener("click", cargarDatosPerfil);
    }
});
cargarDatosPerfil();

/* ===== GUARDAR NOMBRE Y FOTO DEL PERFIL ===== */

if (botonGuardarPerfil) {
    botonGuardarPerfil.addEventListener("click", function () {
        const sesion = JSON.parse(
            localStorage.getItem("sesionPrueba") || "null"
        );

        if (!sesion) {
            alert("Debes iniciar sesión para guardar tu perfil.");
            return;
        }
        const nombre = perfilNombre.value.trim();

        if (!nombre) {
            alert("Escribe tu nombre.");
            perfilNombre.focus();
            return;
        }

        const usuarios = JSON.parse(
            localStorage.getItem("usuariosPrueba") || "[]"
        );

        const usuario = usuarios.find(function (elemento) {
            return elemento.correo === sesion.correo;
        });

        if (!usuario) {
            alert("No se encontró la cuenta del usuario.");
            return;
        }

        // Actualizar el nombre y conservar la foto seleccionada.
        usuario.nombre = nombre;
        sesion.nombre = nombre;

        usuario.foto = fotoPerfilPendiente;
        sesion.foto = fotoPerfilPendiente;

        // Guardar los datos actualizados.
        localStorage.setItem(
            "usuariosPrueba",
            JSON.stringify(usuarios)
        );

        localStorage.setItem(
            "sesionPrueba",
            JSON.stringify(sesion)
        );

        console.log("Foto guardada:", {
            existeFoto: Boolean(sesion.foto),
            longitudFoto: sesion.foto ? sesion.foto.length : 0
        });

        alert("Perfil guardado correctamente.");
    });
}
/* ===== FOTO DE PERFIL Y GUARDADO ===== */

const perfilFoto = document.querySelector("#perfil-foto");
const perfilFotoArchivo = document.querySelector("#perfil-foto-archivo");
const perfilAvatarIcono = document.querySelector("#perfil-avatar-icono");

let fotoPerfilPendiente = null;

// Mostrar una imagen seleccionada.
function mostrarFotoPerfil(foto) {
    if (foto) {
        perfilFoto.src = foto;
        perfilFoto.hidden = false;
        perfilAvatarIcono.hidden = true;
    } else {
        perfilFoto.removeAttribute("src");
        perfilFoto.hidden = true;
        perfilAvatarIcono.hidden = false;
    }
}

/* Seleccionar una foto de perfil y pedir confirmación */

if (perfilFotoArchivo) {
    perfilFotoArchivo.addEventListener("change", function () {
        const archivo = perfilFotoArchivo.files[0];

        if (!archivo) return;

        if (!archivo.type.startsWith("image/")) {
            alert("Selecciona un archivo de imagen válido.");
            perfilFotoArchivo.value = "";
            return;
        }

        if (archivo.size > 1024 * 1024) {
            alert("La foto debe pesar como máximo 1 MB.");
            perfilFotoArchivo.value = "";
            return;
        }

        const lector = new FileReader();

        lector.onload = function () {
            const confirmar = window.confirm(
                "¿Quieres utilizar esta imagen como foto de perfil?"
            );

            if (!confirmar) {
                perfilFotoArchivo.value = "";
                return;
            }

            fotoPerfilPendiente = lector.result;
            mostrarFotoPerfil(fotoPerfilPendiente);
        };

        lector.readAsDataURL(archivo);
    });
}
/* ===== CARGAR DATOS Y FOTO DEL PERFIL ===== */

cargarDatosPerfil = function () {
    const sesion = JSON.parse(
        localStorage.getItem("sesionPrueba") || "null"
    );

    if (!sesion) {
        perfilNombre.value = "";
        perfilCorreo.value = "";
        perfilCorreo.readOnly = false;

        fotoPerfilPendiente = null;
        mostrarFotoPerfil(null);
        return;
    }

    perfilNombre.value = sesion.nombre || "";
    perfilCorreo.value = sesion.correo || "";
    perfilCorreo.readOnly = true;

   // Recuperar la foto de la sesión o de la cuenta guardada.
 const usuariosGuardados = JSON.parse(
     localStorage.getItem("usuariosPrueba") || "[]"
 );

 const usuarioGuardado = usuariosGuardados.find(function (usuario) {
     return usuario.correo === sesion.correo;
 });

 fotoPerfilPendiente = sesion.foto || usuarioGuardado?.foto || null;

 mostrarFotoPerfil(fotoPerfilPendiente);
 console.log("Diagnóstico al cargar perfil:", {
    tieneFotoSesion: Boolean(sesion.foto),
    tieneFotoCuenta: Boolean(usuarioGuardado?.foto),
    tieneFotoPendiente: Boolean(fotoPerfilPendiente),
    existeElementoImagen: Boolean(perfilFoto),
    srcAsignado: perfilFoto?.getAttribute("src")?.slice(0, 30)
});

 // Sincronizar la foto recuperada con la sesión.
const sesionActual = JSON.parse(
    localStorage.getItem("sesionPrueba") || "null"
);

if (sesionActual && fotoPerfilPendiente && !sesionActual.foto) {
    sesionActual.foto = fotoPerfilPendiente;

    localStorage.setItem(
        "sesionPrueba",
        JSON.stringify(sesionActual)
    );
}
};