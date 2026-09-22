#!/usr/bin/env python3
# Genera una guia-resumen ORIGINAL tipo INFOGRAFIA en PDF (con nuestras palabras).
# Segura para AdSense (no reproduce material de terceros).
from fpdf import FPDF

AZUL = (31, 71, 245)
NAVY = (17, 24, 39)
GRIS = (51, 65, 85)
CLARO = (100, 116, 139)
FONDO = (238, 244, 255)
BLANCO = (255, 255, 255)

SECCIONES = [
    ("Filosofia de la venta racional",
     "Vender es ayudar a decidir, no empujar.",
     [("Convicción + confianza", "La venta es transferir convicción sobre un puente de confianza. Sin confianza, nadie cruza."),
      ("Emoción y lógica", "La emoción abre la puerta; la lógica sostiene la decisión y evita el arrepentimiento."),
      ("El 'no' es tu trabajo", "Si el prospecto ya tuviera la respuesta, no te necesitaría. Planifica para el 'no'."),
      ("El protagonista es él", "Desaparece tú y magnifica al cliente. No se trata de ti, se trata de su resultado.")]),
    ("Obstaculos vs. objeciones",
     "La resistencia son capas que esconden un miedo.",
     [("La cebolla de la culpa", "Capas: circunstancias (tiempo/dinero), los otros (pareja/socios) y, en el centro, uno mismo."),
      ("Antes del precio", "Un obstáculo se destruye con curiosidad antes de pedir la venta."),
      ("La zona roja", "Tras el precio aparece la objeción real. Es un baile con lógica, no una pelea.")]),
    ("Barreras de tiempo y dinero",
     "Casi nunca son la razón verdadera.",
     [("Falacia cuándo-entonces", "Si solo puedes empezar 'cuando tengas tiempo', fallarás al primer imprevisto. Empieza ocupado."),
      ("Recursos vs. recursividad", "No te faltan recursos, te falta decidir resolver. El dinero aparece cuando algo es prioridad."),
      ("Pagas igual", "Vas a gastar de todos modos: eliges pagar con dinero hoy o con años de tiempo perdido.")]),
    ("Identidad, ajuste y autoridad",
     "Toda compra es un cambio de identidad.",
     [("Nueva identidad", "Un resultado nuevo exige prioridades nuevas. Inviertes en la persona que quieres ser."),
      ("Cierre hipotético", "'Si fuera perfecto, ¿lo harías?' Un 'no' revela falta de confianza; un 'sí', qué falta resolver."),
      ("Apoyo, no permiso", "No pides permiso para mejorar tu vida: informas que lo harás y pides apoyo.")]),
    ("Neutralizar la postergación",
     "Las decisiones requieren información, no tiempo.",
     [("Marco de 3 tiempos", "Pasado: no dejes que un error te queme dos veces. Presente: decide con datos. Futuro: mide el costo de no actuar."),
      ("4 preguntas clave", "¿Crees que funciona?, ¿confías en mí?, ¿crees que funcionará para ti?, ¿tienes acceso al dinero?"),
      ("La silla mecedora", "Decide por tu yo de 80 años: te arrepentirás de lo que no intentaste, no de intentarlo.")]),
    ("El marco CLOSER",
     "Un protocolo para estar 100% presente.",
     [("C - L - O", "Clarificar la razón, Etiquetar el problema y hacer un Overview de lo intentado antes."),
      ("S - E - R", "Vender el destino (no el vuelo), Explicar con curiosidad, y Reforzar la decisión en 48 horas."),
      ("BAMFAM", "Nunca cierres una reunión sin agendar la siguiente. El limbo mata las ventas.")]),
    ("Práctica y maestría",
     "El sistema solo funciona con práctica deliberada.",
     [("Game tape", "Graba y revisa tus llamadas. No solo las palabras: escucha tu tonalidad."),
      ("Tono que cierra", "La curiosidad y la autoridad tranquila cierran; la agresividad desesperada espanta."),
      ("Looping", "Resuelve la duda, confirma que quedó clara y vuelve a pedir la venta, con respeto.")]),
]


class Info(FPDF):
    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-14)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*CLARO)
        self.cell(0, 8, f"Como vender mejor que el 99%   -   resumenes-negocios.vercel.app   -   pag. {self.page_no()}", align="C")


pdf = Info(format="A4")
pdf.set_auto_page_break(auto=True, margin=16)
M = 16
W = 210 - 2 * M

# ---------- PORTADA ----------
pdf.add_page()
pdf.set_fill_color(*NAVY)
pdf.rect(0, 0, 210, 130, "F")
pdf.set_fill_color(*AZUL)
pdf.rect(0, 118, 210, 12, "F")
pdf.set_xy(M, 34)
pdf.set_text_color(*BLANCO)
pdf.set_font("Helvetica", "B", 34)
pdf.multi_cell(W, 14, "Como vender mejor\nque el 99% de las personas")
pdf.set_xy(M, 92)
pdf.set_text_color(188, 211, 255)
pdf.set_font("Helvetica", "B", 15)
pdf.cell(0, 8, "GUIA INFOGRAFICA  -  7 CLAVES DE PSICOLOGIA DE VENTAS")
pdf.set_xy(M, 145)
pdf.set_text_color(*GRIS)
pdf.set_font("Helvetica", "", 12)
pdf.multi_cell(W, 7, "Una sintesis clara y accionable de la venta racional: como ayudar a las personas "
    "a tomar una buena decision, desarmar sus objeciones con logica y cerrar con confianza.")
# Mini indice
pdf.ln(6)
for i, (t, _, _) in enumerate(SECCIONES, 1):
    pdf.set_x(M)
    pdf.set_fill_color(*AZUL)
    pdf.set_text_color(*BLANCO)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(8, 8, str(i), align="C", fill=True)
    pdf.set_text_color(*GRIS)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, "  " + t, ln=1)
    pdf.ln(1)
pdf.set_y(264)
pdf.set_text_color(*CLARO)
pdf.set_font("Helvetica", "", 9)
pdf.multi_cell(W, 5, "Resumen educativo original de Resumenes de Negocios, inspirado en la "
    "metodologia de venta racional de Alex Hormozi. No reproduce sus materiales.")


def tarjeta(titulo, texto):
    """Dibuja una tarjeta redondeada con titulo y texto, altura dinamica."""
    pdf.set_font("Helvetica", "", 11)
    alto_txt = pdf.multi_cell(W - 16, 6, texto, dry_run=True, output="HEIGHT")
    h = alto_txt + 16
    if pdf.get_y() + h > 285:
        pdf.add_page()
    x, y = M, pdf.get_y()
    pdf.set_fill_color(*FONDO)
    pdf.rect(x, y, W, h, style="F", round_corners=True, corner_radius=3)
    pdf.set_fill_color(*AZUL)
    pdf.rect(x, y, 3, h, style="F")
    pdf.set_xy(x + 8, y + 5)
    pdf.set_text_color(*AZUL)
    pdf.set_font("Helvetica", "B", 12)
    pdf.multi_cell(W - 16, 6, titulo)
    pdf.set_x(x + 8)
    pdf.set_text_color(*GRIS)
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(W - 16, 6, texto)
    pdf.set_y(y + h + 5)


for i, (titulo, subt, items) in enumerate(SECCIONES, 1):
    pdf.add_page()
    # Banda de cabecera
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, 210, 40, "F")
    pdf.set_fill_color(*AZUL)
    pdf.ellipse(M, 10, 20, 20, "F")
    pdf.set_xy(M, 14)
    pdf.set_text_color(*BLANCO)
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(20, 12, str(i), align="C")
    pdf.set_xy(M + 26, 10)
    pdf.set_text_color(*BLANCO)
    pdf.set_font("Helvetica", "B", 17)
    pdf.multi_cell(W - 26, 8, titulo)
    pdf.set_xy(M + 26, pdf.get_y())
    pdf.set_text_color(188, 211, 255)
    pdf.set_font("Helvetica", "I", 11)
    pdf.multi_cell(W - 26, 6, subt)
    pdf.set_y(50)
    for (ct, cx) in items:
        tarjeta(ct, cx)

import os
os.makedirs("public/guias", exist_ok=True)
pdf.output("public/guias/guia-infografia-vender-mejor-99.pdf")
print("Infografia generada: public/guias/guia-infografia-vender-mejor-99.pdf")
