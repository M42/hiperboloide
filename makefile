all: hiperboloide.pdf presentacion.pdf

presentacion.pdf: presentacion.tex
	pdflatex presentacion.tex

hiperboloide.pdf: hiperboloide.tex
	xelatex hiperboloide.tex
