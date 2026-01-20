import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat } from 'docx'

interface Campo {
  id: string
  nome: string
  tipo: 'texto' | 'texto_longo' | 'lista' | 'data'
  obrigatorio: boolean
}

interface Template {
  id: number
  nome: string
  descricao: string
  equipe: string
  campos: Campo[]
}

export async function POST(request: NextRequest) {
  try {
    const { template, dados, formato } = await request.json()

    if (!template || !dados || !formato) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Gerar conteúdo do documento
    const children: any[] = []

    // Título
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: template.nome,
            bold: true,
            size: 48, // 24pt
            font: 'Arial'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )

    // Data de geração
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
            size: 20,
            color: '666666',
            font: 'Arial'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      })
    )

    // Linha separadora
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '─'.repeat(60),
            color: 'CCCCCC'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )

    // Campos preenchidos
    for (const campo of template.campos) {
      const valor = dados[campo.id]

      // Nome do campo
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: campo.nome,
              bold: true,
              size: 24,
              font: 'Arial'
            })
          ],
          spacing: { before: 300, after: 100 }
        })
      )

      // Valor do campo
      if (campo.tipo === 'lista' && Array.isArray(valor)) {
        // Lista de itens
        valor.filter((item: string) => item.trim()).forEach((item: string) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${item}`,
                  size: 22,
                  font: 'Arial'
                })
              ],
              indent: { left: 720 },
              spacing: { after: 80 }
            })
          )
        })
      } else if (campo.tipo === 'data' && valor) {
        // Data formatada
        const dataFormatada = new Date(valor + 'T00:00:00').toLocaleDateString('pt-BR')
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: dataFormatada,
                size: 22,
                font: 'Arial'
              })
            ],
            spacing: { after: 200 }
          })
        )
      } else if (campo.tipo === 'texto_longo' && valor) {
        // Texto longo - quebrar em parágrafos
        const paragrafos = valor.split('\n').filter((p: string) => p.trim())
        paragrafos.forEach((paragrafo: string) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragrafo,
                  size: 22,
                  font: 'Arial'
                })
              ],
              spacing: { after: 120 }
            })
          )
        })
      } else {
        // Texto simples
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: valor || '(não preenchido)',
                size: 22,
                font: 'Arial',
                italics: !valor
              })
            ],
            spacing: { after: 200 }
          })
        )
      }
    }

    // Rodapé
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '─'.repeat(60),
            color: 'CCCCCC'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 }
      })
    )

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Documento gerado pelo Portal TI - ${template.equipe}`,
            size: 18,
            color: '999999',
            font: 'Arial'
          })
        ],
        alignment: AlignmentType.CENTER
      })
    )

    // Criar documento
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Arial',
              size: 24
            }
          }
        }
      },
      sections: [{
        properties: {
          page: {
            size: {
              width: 12240, // 8.5 inches (US Letter)
              height: 15840 // 11 inches
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }]
    })

    // Gerar buffer
    const buffer = await Packer.toBuffer(doc)

    if (formato === 'pdf') {
      // Para PDF, retornamos o DOCX por enquanto
      // A conversão para PDF requer LibreOffice no servidor
      // Alternativa: usar uma biblioteca como pdf-lib ou jspdf no frontend
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${template.nome.replace(/\s+/g, '_')}.docx"`
        }
      })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${template.nome.replace(/\s+/g, '_')}.docx"`
      }
    })

  } catch (error) {
    console.error('Erro ao gerar documento:', error)
    return NextResponse.json({ error: 'Erro ao gerar documento' }, { status: 500 })
  }
}