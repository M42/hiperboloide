all: docs/hiperboloide.pdf docs/presentacion.pdf

presentacion.pdf: presentacion.tex
	pdflatex presentacion.tex

hiperboloide.pdf: hiperboloide.tex
	xelatex hiperboloide.tex

docs/presentacion.pdf: presentacion.tex
	pdflatex presentacion.tex -o docs/presentacion.pdf

docs/hiperboloide.pdf: hiperboloide.tex
	xelatex hiperboloide.tex -o docs/hiperboloide.pdf