#!/usr/bin/env python3
# Genera una guia-resumen ORIGINAL en PDF (con nuestras palabras) para usar como
# lead magnet seguro para AdSense. No reproduce material de terceros.
from fpdf import FPDF

AZUL = (31, 71, 245)
GRIS = (51, 65, 85)
CLARO = (100, 116, 139)

class Guia(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*CLARO)
        self.cell(0, 8, "Resumenes de Negocios  -  Como vender mejor que el 99%", align="L")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*CLARO)
        self.cell(0, 10, f"Pagina {self.page_no()}  -  resumenes-negocios.vercel.app", align="C")

pdf = Guia()
pdf.set_auto_page_break(auto=True, margin=18)
pdf.set_margins(20, 20, 20)

# ---- Portada ----
pdf.add_page()
pdf.ln(30)
pdf.set_text_color(*AZUL)
pdf.set_font("Helvetica", "B", 30)
pdf.multi_cell(0, 14, "Como vender mejor\nque el 99% de las personas", align="L")
pdf.ln(4)
pdf.set_text_color(*GRIS)
pdf.set_font("Helvetica", "", 15)
pdf.multi_cell(0, 8, "Guia rapida: 7 lecciones de psicologia de ventas,\nresumidas de forma clara y accionable.", align="L")
pdf.ln(10)
pdf.set_text_color(*CLARO)
pdf.set_font("Helvetica", "", 11)
pdf.multi_cell(0, 6, "Resumen educativo original elaborado por Resumenes de Negocios,\ninspirado en la metodologia de venta racional de Alex Hormozi.\nNo reproduce sus materiales.")

secciones = [
    ("Dia 1  -  La venta como responsabilidad", [
        "Vender bien no es presionar: es ayudar a alguien a tomar una decision que ya desea.",
        "La emocion enciende la decision; la logica la sostiene y evita el arrepentimiento.",
        "Formula util: la venta = conviccion que transmites x confianza que generas.",
        "Si no crees de verdad que tu solucion ayuda, no tienes derecho a pedir la compra.",
    ]),
    ("Dia 2  -  Obstaculos vs. objeciones", [
        "Un obstaculo aparece antes del precio; una objecion, despues. Se tratan distinto.",
        "Neutraliza los obstaculos con curiosidad antes de pedir el compromiso.",
        "Las excusas no son ataques: son formas de evitar el miedo a decidir.",
        "La 'cebolla de la culpa': circunstancias, los otros y, en el nucleo, uno mismo.",
    ]),
    ("Dia 3  -  Tiempo y dinero", [
        "'No tengo tiempo' y 'es muy caro' casi nunca son la razon real.",
        "El mejor momento para empezar suele ser cuando estas mas ocupado.",
        "Vas a gastar ese dinero igual; la pregunta es en que lo inviertes.",
        "No te faltan recursos, te falta decidir que esto es prioritario.",
    ]),
    ("Dia 4  -  Ajuste y autoridad", [
        "'No es para mi' suele significar 'no quiero el esfuerzo que exige'.",
        "Cierre hipotetico: 'si fuera perfecto, lo harias?' separa el metodo del miedo.",
        "Ante 'debo consultarlo', valida la relacion y devuelve el poder de decidir.",
        "Nueva identidad = nuevas prioridades: inviertes en quien quieres llegar a ser.",
    ]),
    ("Dia 5  -  'Necesito pensarlo'", [
        "Pensarlo sin informacion nueva no es reflexionar: es posponer.",
        "No es una decision rapida; es cerrar una decision que llevas anos aplazando.",
        "No dejes que un mal recuerdo del pasado te congele una buena decision hoy.",
        "Tres preguntas: crees en el producto, confias en mi, te crees capaz?",
    ]),
    ("Dia 6  -  El marco CLOSER", [
        "Clarificar la razon real por la que estan ahi (eres diagnosticador).",
        "Etiquetar el problema y lograr que el cliente lo acepte.",
        "Revisar el pasado para descartar falsas alternativas.",
        "Vender el destino (la transformacion), no la lista de modulos.",
        "Explorar y resolver objeciones; y Reforzar la decision al cerrar.",
    ]),
    ("Dia 7  -  Practica y tonalidad", [
        "La venta es un motor de mejora continua, no un evento aislado.",
        "La conviccion real corrige tu tono solo: no finjas seguridad.",
        "El cierre es un baile, no una pelea: aisla, pregunta, confirma y pide.",
        "Graba y revisa tus llamadas: es lo que separa al profesional del amateur.",
    ]),
]

for titulo, puntos in secciones:
    pdf.add_page()
    pdf.set_text_color(*AZUL)
    pdf.set_font("Helvetica", "B", 18)
    pdf.multi_cell(0, 10, titulo)
    pdf.ln(3)
    pdf.set_text_color(*GRIS)
    pdf.set_font("Helvetica", "", 12)
    for p in puntos:
        pdf.set_text_color(*AZUL)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(6, 7, ">")
        pdf.set_text_color(*GRIS)
        pdf.set_font("Helvetica", "", 12)
        pdf.multi_cell(0, 7, " " + p)
        pdf.ln(1)

# ---- Cierre ----
pdf.add_page()
pdf.set_text_color(*AZUL)
pdf.set_font("Helvetica", "B", 18)
pdf.multi_cell(0, 10, "Y ahora, que?")
pdf.ln(3)
pdf.set_text_color(*GRIS)
pdf.set_font("Helvetica", "", 12)
pdf.multi_cell(0, 7, "Elige UNA idea de esta guia y aplicala en tu proxima conversacion de ventas. "
    "Luego suma otra. La maestria no viene de saber mas, sino de practicar lo que ya sabes.\n\n"
    "Encuentra la serie completa y mas resumenes de negocios en:")
pdf.ln(2)
pdf.set_text_color(*AZUL)
pdf.set_font("Helvetica", "B", 13)
pdf.multi_cell(0, 8, "resumenes-negocios.vercel.app/curso/vender-mejor-99")

import os
os.makedirs("public/guias", exist_ok=True)
pdf.output("public/guias/guia-vender-mejor-99.pdf")
print("PDF generado: public/guias/guia-vender-mejor-99.pdf")
