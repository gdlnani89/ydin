const app = Vue.createApp({
    data() {
        return {
            menuAtivo: '',
            menuAtivoCartao: true,
            menuAtivoDebito: true,
            dia: new Date().getDate(),
            mes: new Date().getMonth() + 1,
            ano: new Date().getFullYear(),
            despesas: [],
            despesasCartao: [],
            despesasDebito: [],
            receitas: [],
            investimentos: [],
            dividas: [],
            controles: [],
            historicoPagamentos: [],
            nomeTipoControle: '',
            valorPadraoTipo: '0,00',
            tiposControle: [],
            tiposControlesSalvos: [],
            totalDespesas: 0,
            totalReceitas: 0,
            totalInvestimentos: 0,
            totalDividas: 0,
            saldo: 0,
            novaDespesa: {
                id: null,
                descricao: '',
                tipo: '',
                valor: '0,00',
                debitoCredito: 'd',
                valorParcela: '0,00',
                parcelas: '1',
                parcelaNumero: 1,
                data: ''
            },
            novaReceita: {
                id: null,
                descricao: '',
                valor: '0,00',
                data: ''
            },
            novaInvestimento: {
                id: null,
                descricao: '',
                valor: '0,00',
                data: ''
            },
            novaDivida: {
                id: null,
                descricao: '',
                valor: '0,00',
                taxa: '0',
                prazo: '1',
                data: '',
                vencimento: ''
            },
            controle: {
                id: null,
                descricao: '',
                valor: '0,00',
            },
            novaControle: {
                id: null,
                tipo: '',
                valor: '0,00',
                valorPadrao: '0,00',
                data: '',
                pago: false
            },
            editandoControle: false,
            editandoTipo: false,
            tipoEditando: null,
            bsModalControle: null,
            editandoDespesa: false,
            editandoReceita: false,
            editandoInvestimento: false,
            editandoDivida: false, 
            adicionandoTipo: false,
            bsModal: null,
            bsModalReceita: null,
            bsModalInvestimento: null,
            bsModalDivida: null,
            currentSection: 'dashboard',
            nomeTipoOriginal: '',
            bsModalTipo: null,
        };
    },
    methods: {
        adicionarTipo() {
            if (this.editandoTipo) {
                // Editar tipo existente
                const index = this.tiposControlesSalvos.findIndex(t => t.id === this.tipoEditando.id);
                if (index !== -1) {
                    this.tiposControlesSalvos[index].nome = this.nomeTipoControle;
                    this.tiposControlesSalvos[index].valorPadrao = this.valorPadraoTipo || '0,00';
                    // Atualizar controles que usam este tipo
                    this.controles.forEach(controle => {
                        if (controle.tipo === this.tipoEditando.nome) {
                            controle.tipo = this.nomeTipoControle;
                        }
                    });
                }
                this.editandoTipo = false;
                this.tipoEditando = null;
            } else {
                // Adicionar novo tipo
                const novoTipo = {
                    id: Date.now(),
                    nome: this.nomeTipoControle,
                    valorPadrao: this.valorPadraoTipo || '0,00'
                };
                this.tiposControlesSalvos.push(novoTipo);
            }
            this.nomeTipoControle = '';
            this.valorPadraoTipo = '0,00';
            this.salvarLocalStorage();
        },
        trocarMenu(menu) {
            if (!menu) return;
            this.menuAtivo = menu;
            this.currentSection = menu;
        },
        formatarComoMoeda(e, dadoNovo) {
            if (!e || !e.target || !dadoNovo) return;
            
            // Remove tudo que não é número
            let valorApenasDigitos = e.target.value.replace(/\D/g, '');

            if (!valorApenasDigitos) {
                dadoNovo.valor = '0,00';
                return;
            }

            const valorNumerico = Number(valorApenasDigitos) / 100;

            dadoNovo.valor = valorNumerico.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        },
        atualizarFiltrosComDataDoItem(item) {
            if (!item || !item.data) return;
            
            let partesData;
            
            if (item.data.includes('/')) {
                // Formato DD/MM/YYYY
                partesData = item.data.split('/');
            } else if (item.data.includes('-')) {
                // Formato YYYY-MM-DD
                const dataParts = item.data.split('-');
                partesData = [dataParts[2], dataParts[1], dataParts[0]];
            } else {
                return; // Formato não reconhecido
            }
            
            if (partesData.length !== 3) return;
            
            this.dia = parseInt(partesData[0], 10);
            this.mes = parseInt(partesData[1], 10);
            this.ano = parseInt(partesData[2], 10);
        },
        salvarInvestimento() {
            if (this.editandoInvestimento) {
                const index = this.investimentos.findIndex(i => i.id === this.novaInvestimento.id);
                if (index !== -1) {
                    // Se a data foi alterada, usar a nova data
                    if (this.novaInvestimento.data && this.novaInvestimento.data.includes('-')) {
                        // Converter data do formato YYYY-MM-DD para DD/MM/YYYY
                        const dataParts = this.novaInvestimento.data.split('-');
                        this.novaInvestimento.data = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
                    } else {
                        this.novaInvestimento.data = this.dataFormatada(this.dia, this.mes, this.ano);
                    }
                    this.investimentos[index] = { ...this.novaInvestimento };
                }
            } else {
                this.novaInvestimento.id = Date.now();
                this.novaInvestimento.data = this.dataFormatada(this.dia, this.mes, this.ano);
                this.investimentos.push({ ...this.novaInvestimento });
            }
            this.calcularTotalInvestimentos();
            this.salvarLocalStorage();
            this.resetForm();
            this.bsModalInvestimento.hide();
            this.calcularSaldo();
        },
        salvarControle() {
            if (this.editandoControle) {
                const index = this.controles.findIndex(c => c.id === this.novaControle.id);
                if (index !== -1) {
                    if (this.novaControle.data && this.novaControle.data.includes('-')) {
                        const dataParts = this.novaControle.data.split('-');
                        this.novaControle.data = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
                    } else {
                        this.novaControle.data = this.dataFormatada(this.dia, this.mes, this.ano);
                    }
                    this.controles[index] = { ...this.novaControle };
                }
            } else {
                this.novaControle.id = Date.now();
                if (this.novaControle.data && this.novaControle.data.includes('-')) {
                    const dataParts = this.novaControle.data.split('-');
                    this.novaControle.data = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
                } else {
                    this.novaControle.data = this.dataFormatada(this.dia, this.mes, this.ano);
                }
                this.controles.push({ ...this.novaControle });
            }
            this.calcularTotalControles();
            this.salvarLocalStorage();
            this.resetForm();
            this.bsModalControle.hide();
            this.calcularSaldo();
        },
        filtrarControlesPorTipo(tipo) {
            return this.controles.filter(c => c.tipo === tipo);
        },
        calcularTotalControlesPorTipo(tipo) {
            const arrayControles = this.filtrarControlesPorTipo(tipo);
            const total = arrayControles.reduce((soma, c) => soma + parseFloat(c.valor.replace(/\./g, '').replace(',', '.')), 0);
            
            const totalFormatado = total.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return totalFormatado;
        },
        excluirTipo(id) {
            if (confirm('Tem certeza que deseja excluir este tipo? Todos os controles associados também serão excluídos.')) {
                // Encontrar o tipo para saber o nome
                const tipo = this.tiposControlesSalvos.find(t => t.id === id);
                if (tipo) {
                    // Remover controles associados a este tipo
                    this.controles = this.controles.filter(c => c.tipo !== tipo.nome);
                }
                // Remover o tipo
                this.tiposControlesSalvos = this.tiposControlesSalvos.filter(t => t.id !== id);
                this.salvarLocalStorage();
                this.calcularTotalControles();
                this.calcularSaldo();
            }
        },
        editarTipo(tipo) {
            this.nomeTipoControle = tipo.nome;
            this.valorPadraoTipo = tipo.valorPadrao || '0,00';
            this.editandoTipo = true;
            this.tipoEditando = tipo;
            this.nomeTipoOriginal = tipo.nome;
        },
        salvarTipoEditado() {
            if (this.tipoEditando) {
                const index = this.tiposControlesSalvos.findIndex(t => t.id === this.tipoEditando.id);
                if (index !== -1) {
                    this.tiposControlesSalvos[index].nome = this.nomeTipoControle;
                    this.tiposControlesSalvos[index].valorPadrao = this.valorPadraoTipo || '0,00';
                    // Atualizar controles que usam este tipo
                    this.controles.forEach(controle => {
                        if (controle.tipo === this.nomeTipoOriginal) {
                            controle.tipo = this.nomeTipoControle;
                        }
                    });
                }
                this.resetForm();
                this.bsModalTipo.hide();
                this.salvarLocalStorage();
            }
        },
        cancelarEdicaoTipo() {
            this.resetForm();
            this.bsModalTipo.hide();
        },
        preencherValorPadrao() {
            if (this.novaControle.tipo) {
                const tipoSelecionado = this.tiposControlesSalvos.find(t => t.nome === this.novaControle.tipo);
                if (tipoSelecionado && tipoSelecionado.valorPadrao && tipoSelecionado.valorPadrao !== '0,00') {
                    this.novaControle.valor = tipoSelecionado.valorPadrao;
                }
            }
        },
        marcarComoPago(tipo) {
            if (tipo.valorPadrao && tipo.valorPadrao !== '0,00') {
                // Buscar todos os controles deste tipo que não estão pagos
                const controlesDoTipo = this.controles.filter(c => c.tipo === tipo.nome && !c.pago);
                
                if (controlesDoTipo.length > 0) {
                    // Calcular valor total do período
                    const valorTotal = controlesDoTipo.reduce((soma, c) => {
                        const valor = parseFloat(c.valor.replace(/\./g, '').replace(',', '.'));
                        return soma + valor;
                    }, 0);
                    
                    // Remover os controles da lista principal
                    this.controles = this.controles.filter(c => !(c.tipo === tipo.nome && !c.pago));
                    
                    // Criar um registro de pagamento no histórico
                    const pagamento = {
                        id: Date.now(),
                        tipo: tipo.nome,
                        valor: valorTotal.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }),
                        data: this.dataFormatada(this.dia, this.mes, this.ano),
                        pago: true,
                        dataPagamento: new Date().toISOString(),
                        periodo: `${controlesDoTipo.length} controle(s)`,
                        controlesOriginais: controlesDoTipo // Manter referência dos controles originais
                    };
                    
                    // Adicionar ao histórico (vamos criar uma propriedade separada para histórico)
                    if (!this.historicoPagamentos) {
                        this.historicoPagamentos = [];
                    }
                    this.historicoPagamentos.push(pagamento);
                    
                    this.salvarLocalStorage();
                    this.calcularTotalControles();
                    this.calcularSaldo();
                    
                    // Mostrar mensagem de confirmação
                    alert(`${controlesDoTipo.length} controle(s) de ${tipo.nome} movido(s) para o histórico! Valor total: R$ ${pagamento.valor}`);
                } else {
                    alert(`Nenhum controle pendente encontrado para ${tipo.nome}.`);
                }
            } else {
                alert('Este tipo não possui valor padrão definido.');
            }
        },
        mostrarHistoricoPagamentos(tipo) {
            const pagamentos = this.historicoPagamentos.filter(h => h.tipo === tipo.nome);
            if (pagamentos.length > 0) {
                const historico = pagamentos.map(p => `${p.data} - R$ ${p.valor} (${p.periodo})`).join('\n');
                const totalPago = pagamentos.reduce((soma, p) => {
                    const valor = parseFloat(p.valor.replace(/\./g, '').replace(',', '.'));
                    return soma + valor;
                }, 0);
                
                alert(`Histórico de pagamentos - ${tipo.nome}:\n\n${historico}\n\nTotal pago: R$ ${totalPago.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
            } else {
                alert(`Nenhum pagamento registrado para ${tipo.nome}.`);
            }
        },
        desmarcarComoPago(tipo) {
            const pagamentos = this.historicoPagamentos.filter(h => h.tipo === tipo.nome);
            
            if (pagamentos.length > 0) {
                if (confirm(`Deseja restaurar os controles de ${tipo.nome} do histórico?`)) {
                    // Restaurar os controles originais
                    pagamentos.forEach(pagamento => {
                        if (pagamento.controlesOriginais) {
                            pagamento.controlesOriginais.forEach(controle => {
                                // Restaurar o controle sem o status pago
                                const controleRestaurado = {
                                    ...controle,
                                    pago: false
                                };
                                delete controleRestaurado.dataPagamento;
                                this.controles.push(controleRestaurado);
                            });
                        }
                    });
                    
                    // Remover do histórico
                    this.historicoPagamentos = this.historicoPagamentos.filter(h => h.tipo !== tipo.nome);
                    
                    this.salvarLocalStorage();
                    this.calcularTotalControles();
                    this.calcularSaldo();
                    
                    alert(`Controles de ${tipo.nome} restaurados com sucesso!`);
                }
            } else {
                alert(`Nenhum pagamento encontrado no histórico para ${tipo.nome}.`);
            }
        },
        temControlesPagos(tipoNome) {
            return this.controles.some(c => c.tipo === tipoNome && !c.pago);
        },
        salvarDespesa() {
            if (this.editandoDespesa) {
                // Edita despesa existente
                const index = this.despesas.findIndex(d => d.id === this.novaDespesa.id);
                if (index !== -1) {
                    // Se é uma despesa parcelada, precisamos recriar todas as parcelas
                    if (this.novaDespesa.debitoCredito === 'c') {
                        // Remover todas as parcelas existentes com a mesma descrição
                        this.despesas = this.despesas.filter(d => d.descricao !== this.novaDespesa.descricao);
                        
                        // Calcular valor da parcela
                        const valorTotal = parseFloat(this.novaDespesa.valor.replace(/\./g, '').replace(',', '.'));
                        const valorParcela = valorTotal / parseInt(this.novaDespesa.parcelas);
                        
                        // Criar uma despesa para cada parcela
                        for (let i = 0; i < parseInt(this.novaDespesa.parcelas); i++) {
                            // Calcular a data correta para cada parcela
                            let mesParcela = this.mes + i;
                            let anoParcela = this.ano;
                            
                            // Ajustar mês e ano se necessário
                            while (mesParcela > 12) {
                                mesParcela -= 12;
                                anoParcela += 1;
                            }
                            
                            const despesaParcela = {
                                ...this.novaDespesa,
                                id: Date.now() + i, // ID único para cada parcela
                                valor: valorParcela.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }),
                                valorParcela: valorParcela.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }),
                                parcelaNumero: i + 1,
                                data: this.dataFormatada(this.dia, mesParcela, anoParcela) // Data correta para cada parcela
                            };
                            this.despesas.push(despesaParcela);
                        }
                    } else {
                        // Despesa à vista - apenas atualizar
                        this.novaDespesa.data = this.dataFormatada(this.dia, this.mes, this.ano);
                        this.despesas[index] = { ...this.novaDespesa };
                    }
                }
            } else {
                // Cria nova despesa
                this.novaDespesa.id = Date.now(); // id único simples
                this.novaDespesa.data = this.dataFormatada(this.dia, this.mes, this.ano);
                if (this.novaDespesa.debitoCredito === 'c') {
                    // Calcular valor da parcela
                    const valorTotal = parseFloat(this.novaDespesa.valor.replace(/\./g, '').replace(',', '.'));
                    const valorParcela = valorTotal / parseInt(this.novaDespesa.parcelas);
                    
                    // Criar uma despesa para cada parcela
                    for (let i = 0; i < parseInt(this.novaDespesa.parcelas); i++) {
                        // Calcular a data correta para cada parcela
                        let mesParcela = this.mes + i;
                        let anoParcela = this.ano;
                        
                        // Ajustar mês e ano se necessário
                        while (mesParcela > 12) {
                            mesParcela -= 12;
                            anoParcela += 1;
                        }
                        
                        const despesaParcela = {
                            ...this.novaDespesa,
                            id: Date.now() + i, // ID único para cada parcela
                            valor: valorParcela.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }),
                            valorParcela: valorParcela.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }),
                            parcelaNumero: i + 1,
                            data: this.dataFormatada(this.dia, mesParcela, anoParcela) // Data correta para cada parcela
                        };
                        this.despesas.push(despesaParcela);
                    }
                } else {
                    // Despesa à vista
                    this.despesas.push({ ...this.novaDespesa });
                }
            }
            this.calcularTotalDespesas();
            this.salvarLocalStorage();
            this.resetForm();
            this.bsModal.hide();
            this.calcularSaldo();
        },
        salvarReceita() {
            if (this.editandoReceita) {
                // Edita receita existente
                const index = this.receitas.findIndex(r => r.id === this.novaReceita.id);
                if (index !== -1) {
                    this.novaReceita.data = this.dataFormatada(this.dia, this.mes, this.ano);
                    this.receitas[index] = { ...this.novaReceita };
                }
            } else {
                // Cria nova receita
                this.novaReceita.id = Date.now(); // id único simples
                this.novaReceita.data = this.dataFormatada(this.dia, this.mes, this.ano);
                this.receitas.push({ ...this.novaReceita });
            }
            this.calcularTotalReceitas();
            this.salvarLocalStorage();
            this.resetForm();
            this.bsModalReceita.hide();
            this.calcularSaldo();
        },
        dataFormatada(dia, mes, ano) {
            if (!dia || !mes || !ano) return '';
            return `${dia}/${mes}/${ano}`;
        },
        editarInvestimento(investimento) {
            this.atualizarFiltrosComDataDoItem(investimento);
            this.novaInvestimento = { ...investimento };
            this.editandoInvestimento = true;

            if (!this.bsModalInvestimento) {
                this.bsModalInvestimento = new bootstrap.Modal(document.getElementById('novoInvestimentoModal'));
            }
            this.bsModalInvestimento.show();
            this.calcularTotalInvestimentos();
            this.calcularSaldo();
        },
        excluirInvestimento(id) {
            this.investimentos = this.investimentos.filter(i => i.id !== id);
            this.salvarLocalStorage();
            this.calcularTotalInvestimentos();
            this.calcularSaldo();
        },
        excluirDespesa(id) {
            this.despesas = this.despesas.filter(d => d.id !== id);
            this.salvarLocalStorage();
            this.calcularTotalDespesas();
            this.calcularSaldo();
        },
        excluirTodasParcelas(descricao) {
            if (confirm(`Tem certeza que deseja excluir todas as parcelas de "${descricao}"?`)) {
                this.despesas = this.despesas.filter(d => d.descricao !== descricao);
                this.salvarLocalStorage();
                this.calcularTotalDespesas();
                this.calcularSaldo();
            }
        },
        editarDespesa(despesa) {
            this.atualizarFiltrosComDataDoItem(despesa);
            
            // Se é uma despesa parcelada, calcular o valor total
            if (despesa.debitoCredito === 'c' && despesa.parcelas > 1) {
                // Encontrar todas as parcelas com a mesma descrição
                const parcelasMesmaDescricao = this.despesas.filter(d => d.descricao === despesa.descricao);
                
                // Calcular o valor total somando todas as parcelas
                const valorTotal = parcelasMesmaDescricao.reduce((soma, parcela) => {
                    let valor = parcela.valor;
                    if (typeof valor === 'string') {
                        valor = valor.replace(/\./g, '').replace(',', '.');
                    }
                    return soma + parseFloat(valor);
                }, 0);
                
                // Criar objeto com valor total
                this.novaDespesa = {
                    ...despesa,
                    valor: valorTotal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })
                };
            } else {
                this.novaDespesa = { ...despesa };
            }
            
            this.editandoDespesa = true;

            if (!this.bsModal) {
                this.bsModal = new bootstrap.Modal(document.getElementById('novaDespesaModal'));
            }
            this.bsModal.show();
            this.calcularTotalDespesas();
            this.calcularSaldo();
        },
        resetForm() {
            this.novaDespesa = {
                id: null,
                descricao: '',
                tipo: '',
                valor: '0,00',
                debitoCredito: 'd',
                valorParcela: '0,00',
                parcelas: '1',
                parcelaNumero: 1,
                data: ''
            };
            this.novaReceita = {
                id: null,
                descricao: '',
                valor: '0,00',
                data: ''
            };
            this.novaInvestimento = {
                id: null,
                descricao: '',
                valor: '0,00',
                data: ''
            };
            this.novaDivida = {
                id: null,
                descricao: '',
                valor: '0,00',
                taxa: '0',
                prazo: '1',
                data: '',
                vencimento: ''
            };
            this.novaControle = {
                id: null,
                tipo: '',
                valor: '0,00',
                valorPadrao: '0,00',
                data: '',
                pago: false
            };
            this.editandoDespesa = false;
            this.editandoReceita = false;
            this.editandoInvestimento = false;
            this.editandoDivida = false;
            this.editandoTipo = false;
            this.tipoEditando = null;
            this.nomeTipoOriginal = '';
            this.valorPadraoTipo = '0,00';
        },
        salvarLocalStorage() {
            try {
                localStorage.setItem('despesas', JSON.stringify(this.despesas || []));
                localStorage.setItem('receitas', JSON.stringify(this.receitas || []));
                localStorage.setItem('investimentos', JSON.stringify(this.investimentos || []));
                localStorage.setItem('dividas', JSON.stringify(this.dividas || []));
                localStorage.setItem('tiposControles', JSON.stringify(this.tiposControlesSalvos || []));
                localStorage.setItem('controles', JSON.stringify(this.controles || []));
                localStorage.setItem('historicoPagamentos', JSON.stringify(this.historicoPagamentos || []));
            } catch (error) {
                console.error('Erro ao salvar dados no localStorage:', error);
            }
        },
        carregarLocalStorage() {
            try {
                const despesasSalvas = JSON.parse(localStorage.getItem('despesas') || '[]');
                const receitasSalvas = JSON.parse(localStorage.getItem('receitas') || '[]');
                const investimentosSalvos = JSON.parse(localStorage.getItem('investimentos') || '[]');
                const dividasSalvas = JSON.parse(localStorage.getItem('dividas') || '[]');
                const controlesSalvos = JSON.parse(localStorage.getItem('controles') || '[]');
                const tiposControlesSalvos = JSON.parse(localStorage.getItem('tiposControles') || '[]');
                const historicoSalvos = JSON.parse(localStorage.getItem('historicoPagamentos') || '[]');

                if (despesasSalvas && Array.isArray(despesasSalvas)) {
                    this.despesas = despesasSalvas;
                }
                if (receitasSalvas && Array.isArray(receitasSalvas)) {
                    this.receitas = receitasSalvas;
                }
                if (investimentosSalvos && Array.isArray(investimentosSalvos)) {
                    this.investimentos = investimentosSalvos;
                }
                if (dividasSalvas && Array.isArray(dividasSalvas)) {
                    this.dividas = dividasSalvas;
                }
                if (controlesSalvos && Array.isArray(controlesSalvos)) {
                    this.controles = controlesSalvos;
                }
                if (tiposControlesSalvos && Array.isArray(tiposControlesSalvos)) {
                    this.tiposControlesSalvos = tiposControlesSalvos;
                }
                if (historicoSalvos && Array.isArray(historicoSalvos)) {
                    this.historicoPagamentos = historicoSalvos;
                }
            } catch (error) {
                console.error('Erro ao carregar dados do localStorage:', error);
                // Inicializar arrays vazios em caso de erro
                this.despesas = [];
                this.receitas = [];
                this.investimentos = [];
                this.dividas = [];
                this.controles = [];
                this.tiposControlesSalvos = [];
                this.historicoPagamentos = [];
            }
        },
        showSection(section) {
            this.menuAtivo = section;
            this.currentSection = section;
        },
        verificaValor(valor) {
            if (!valor) return 0;
            if (typeof valor === 'string') {
                valor = valor.replace(/\./g, '').replace(',', '.');
            }
            return parseFloat(valor) || 0;
        },
        calcularTotal(dadoCarregado) {
            if (!dadoCarregado || !Array.isArray(dadoCarregado)) {
                return '0,00';
            }
            
            const total = dadoCarregado.reduce((soma, item) => {
                let valor = item.valor;

                if (typeof valor === 'string') {
                    valor = valor.replace(/\./g, '').replace(',', '.');
                }
                return soma + (parseFloat(valor) || 0);
            }, 0);

            return total.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        },
        calcularTotalDespesas() {
            this.totalDespesas = this.calcularTotal(this.despesas);
        },
        calcularTotalReceitas() {
            this.totalReceitas = this.calcularTotal(this.receitas);
        },
        calcularTotalInvestimentos() {
            this.totalInvestimentos = this.calcularTotal(this.investimentos);
        },
        calcularTotalControles() {
            this.totalControles = this.calcularTotal(this.controles);
        },
        calcularSaldo() {
            const totalReceitas = this.verificaValor(this.totalReceitas);
            const totalDespesasVencidas = this.totalDespesasVencidas || '0,00';
            const totalDespesas = parseFloat(totalDespesasVencidas.replace(/\./g, '').replace(',', '.'));
            const valorTotal = totalReceitas - totalDespesas;
            this.saldo = valorTotal.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        },
        excluirReceita(id) {
            this.receitas = this.receitas.filter(r => r.id !== id);
            this.salvarLocalStorage();
            this.calcularTotalReceitas();
            this.calcularSaldo();
        },
        editarReceita(receita) {
            this.atualizarFiltrosComDataDoItem(receita);
            this.novaReceita = { ...receita };
            this.editandoReceita = true;

            if (!this.bsModalReceita) {
                this.bsModalReceita = new bootstrap.Modal(document.getElementById('novaReceitaModal'));
            }
            this.bsModalReceita.show();
            this.calcularTotalReceitas();
            this.calcularSaldo();
        },
        ordenarPorDia(lista) {
            if (!lista || !Array.isArray(lista)) return [];
            
            return lista.sort((a, b) => {
                try {
                    if (!a.data || !b.data) return 0;
                    
                    const partesDataA = a.data.split('/');
                    const partesDataB = b.data.split('/');
                    
                    if (partesDataA.length !== 3 || partesDataB.length !== 3) return 0;
                    
                    const diaA = parseInt(partesDataA[0], 10);
                    const diaB = parseInt(partesDataB[0], 10);
                    return diaA - diaB; // Ordem crescente (1, 2, 3...)
                } catch (error) {
                    return 0;
                }
            });
        },
        formatCurrency(valor) {
            if (!valor) return 'R$ 0,00';
            
            if (typeof valor === 'string') {
                valor = valor.replace(/\./g, '').replace(',', '.');
            }
            
            const valorNumerico = parseFloat(valor) || 0;
            return valorNumerico.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        },
        salvarDivida() {
            if (this.editandoDivida) {
                const index = this.dividas.findIndex(d => d.id === this.novaDivida.id);
                if (index !== -1) {
                    // Se a data foi alterada, usar a nova data
                    if (this.novaDivida.data && this.novaDivida.data.includes('-')) {
                        // Converter data do formato YYYY-MM-DD para DD/MM/YYYY
                        const dataParts = this.novaDivida.data.split('-');
                        this.novaDivida.data = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
                    } else {
                        this.novaDivida.data = this.dataFormatada(this.dia, this.mes, this.ano);
                    }
                    this.dividas[index] = { ...this.novaDivida };
                }
            } else {
                this.novaDivida.id = Date.now();
                // Se a data foi alterada, usar a nova data
                if (this.novaDivida.data && this.novaDivida.data.includes('-')) {
                    // Converter data do formato YYYY-MM-DD para DD/MM/YYYY
                    const dataParts = this.novaDivida.data.split('-');
                    this.novaDivida.data = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
                } else {
                    this.novaDivida.data = this.dataFormatada(this.dia, this.mes, this.ano);
                }
                this.dividas.push({ ...this.novaDivida });
            }
            this.calcularTotalDividas();
            this.salvarLocalStorage();
            this.resetForm();
            this.bsModalDivida.hide();
            this.calcularSaldo();
        },
        excluirDivida(id) {
            this.dividas = this.dividas.filter(d => d.id !== id);
            this.salvarLocalStorage();
            this.calcularTotalDividas();
            this.calcularSaldo();
        },
        editarDivida(divida) {
            this.atualizarFiltrosComDataDoItem(divida);
            this.novaDivida = { ...divida };
            this.editandoDivida = true;

            if (!this.bsModalDivida) {
                this.bsModalDivida = new bootstrap.Modal(document.getElementById('novaDividaModal'));
            }
            this.bsModalDivida.show();
            this.calcularTotalDividas();
            this.calcularSaldo();
        },
        calcularTotalDividas() {
            this.totalDividas = this.calcularTotal(this.dividas);
        },
        dividasFiltradas() {
            if (!this.dividas || !Array.isArray(this.dividas)) return [];
            
            const dividasFiltradas = this.dividas.filter(divida => {
                if (!divida || !divida.data) return false;
                
                let partesData;
                
                try {
                    if (divida.data.includes('/')) {
                        // Formato DD/MM/YYYY
                        partesData = divida.data.split('/');
                    } else if (divida.data.includes('-')) {
                        // Formato YYYY-MM-DD
                        const dataParts = divida.data.split('-');
                        partesData = [dataParts[2], dataParts[1], dataParts[0]];
                    } else {
                        return false; // Formato não reconhecido
                    }
                    
                    if (partesData.length !== 3) return false;
                    
                    const mesDaDivida = parseInt(partesData[1], 10);
                    const anoDaDivida = parseInt(partesData[2], 10);

                    return mesDaDivida === this.mes && anoDaDivida === this.ano;
                } catch (error) {
                    return false;
                }
            });
            
            return this.ordenarPorDia(dividasFiltradas);
        },
        totalDividasDoMes() {
            return this.calcularTotal(this.dividasFiltradas);
        },
        despesasVencidas() {
            // Filtra apenas despesas vencidas até a data atual
            if (!this.despesas || !Array.isArray(this.despesas)) return [];
            
            const hoje = new Date();
            const diaAtual = hoje.getDate();
            const mesAtual = hoje.getMonth() + 1;
            const anoAtual = hoje.getFullYear();
            
            return this.despesas.filter(despesa => {
                if (!despesa || !despesa.data) return false;
                
                try {
                    const partesData = despesa.data.split('/');
                    if (partesData.length !== 3) return false;
                    
                    const diaDespesa = parseInt(partesData[0], 10);
                    const mesDespesa = parseInt(partesData[1], 10);
                    const anoDespesa = parseInt(partesData[2], 10);
                    
                    return (anoDespesa < anoAtual) || 
                           (anoDespesa === anoAtual && mesDespesa < mesAtual) ||
                           (anoDespesa === anoAtual && mesDespesa === mesAtual && diaDespesa <= diaAtual);
                } catch (error) {
                    return false;
                }
            });
        },
        despesasFuturas() {
            // Filtra apenas despesas futuras (não vencidas)
            if (!this.despesas || !Array.isArray(this.despesas)) return [];
            
            const hoje = new Date();
            const diaAtual = hoje.getDate();
            const mesAtual = hoje.getMonth() + 1;
            const anoAtual = hoje.getFullYear();
            
            return this.despesas.filter(despesa => {
                if (!despesa || !despesa.data) return false;
                
                try {
                    const partesData = despesa.data.split('/');
                    if (partesData.length !== 3) return false;
                    
                    const diaDespesa = parseInt(partesData[0], 10);
                    const mesDespesa = parseInt(partesData[1], 10);
                    const anoDespesa = parseInt(partesData[2], 10);
                    
                    return (anoDespesa > anoAtual) || 
                           (anoDespesa === anoAtual && mesDespesa > mesAtual) ||
                           (anoDespesa === anoAtual && mesDespesa === mesAtual && diaDespesa > diaAtual);
                } catch (error) {
                    return false;
                }
            });
        },
        ultimasTransacoes() {
            // Combina receitas e despesas
            const todasTransacoes = [];
            
            // Adiciona receitas
            if (this.receitas && Array.isArray(this.receitas)) {
                this.receitas.forEach(receita => {
                    if (receita && receita.data) {
                        todasTransacoes.push({
                            ...receita,
                            tipo: 'receita'
                        });
                    }
                });
            }
            
            // Adiciona despesas
            if (this.despesas && Array.isArray(this.despesas)) {
                this.despesas.forEach(despesa => {
                    if (despesa && despesa.data) {
                        todasTransacoes.push({
                            ...despesa,
                            tipo: 'despesa'
                        });
                    }
                });
            }
            
            // Ordena por data (mais recentes primeiro) e pega as 5 últimas
            return todasTransacoes
                .sort((a, b) => {
                    try {
                        const partesDataA = a.data.split('/');
                        const partesDataB = b.data.split('/');
                        const dataA = new Date(partesDataA[2], partesDataA[1] - 1, partesDataA[0]);
                        const dataB = new Date(partesDataB[2], partesDataB[1] - 1, partesDataB[0]);
                        return dataB - dataA; // Ordem decrescente (mais recentes primeiro)
                    } catch (error) {
                        return 0;
                    }
                })
                .slice(0, 5);
        },
        excluirControle(id) {
            this.controles = this.controles.filter(c => c.id !== id);
            this.salvarLocalStorage();
            this.calcularTotalControles();
            this.calcularSaldo();
        },
        editarControle(controle) {
            this.atualizarFiltrosComDataDoItem(controle);
            this.novaControle = { ...controle };
            this.editandoControle = true;

            if (!this.bsModalControle) {
                this.bsModalControle = new bootstrap.Modal(document.getElementById('novoControleModal'));
            }
            this.bsModalControle.show();
            this.calcularTotalControles();
            this.calcularSaldo();
        }
    },
    watch: {
        mes(novo) {
            // Mês alterado
        },
        ano(novo) {
            // Ano alterado
        }
    },
    computed: {
        despesasFiltradas() {
            // Se não houver despesas, retorna um array vazio
            if (!this.despesas || !Array.isArray(this.despesas)) return [];

            // Filtra as despesas
            return this.despesas.filter(despesa => {
                if (!despesa || !despesa.data) return false;
                
                try {
                    // Divide a data da despesa em [dia, mes, ano]
                    const partesData = despesa.data.split('/');
                    if (partesData.length !== 3) return false;
                    
                    const mesDaDespesa = parseInt(partesData[1], 10);
                    const anoDaDespesa = parseInt(partesData[2], 10);

                    // Compara com o mês e ano selecionados
                    return mesDaDespesa === this.mes && anoDaDespesa === this.ano;
                } catch (error) {
                    return false;
                }
            });
        },
        despesasCartaoFiltradas() {
            const despesasCartao = this.despesasFiltradas.filter(despesa => despesa.debitoCredito === 'c');
            return this.ordenarPorDia(despesasCartao);
        },
        despesasDebitoFiltradas() {
            const despesasDebito = this.despesasFiltradas.filter(despesa => despesa.debitoCredito === 'd');
            return this.ordenarPorDia(despesasDebito);
        },
        receitasFiltradas() {
            // Se não houver receitas, retorna um array vazio
            if (!this.receitas || !Array.isArray(this.receitas)) return [];

            // Filtra as receitas
            const receitasFiltradas = this.receitas.filter(receita => {
                if (!receita || !receita.data) return false;
                
                try {
                    const partesData = receita.data.split('/');
                    if (partesData.length !== 3) return false;
                    
                    const mesDaReceita = parseInt(partesData[1], 10);
                    const anoDaReceita = parseInt(partesData[2], 10);

                    return mesDaReceita === this.mes && anoDaReceita === this.ano;
                } catch (error) {
                    return false;
                }
            });
            
            return this.ordenarPorDia(receitasFiltradas);
        },
        totalDespesasDoMes() {
            // Reutiliza sua função de cálculo, mas com os dados filtrados
            return this.calcularTotal(this.despesasFiltradas);
        },
        totalReceitasDoMes() {
            // Reutiliza sua função de cálculo, mas com os dados filtrados
            return this.calcularTotal(this.receitasFiltradas);
        },
        
        totalInvestimentosDoMes() {
            return this.calcularTotal(this.investimentos);
        },
        totalDespesasVencidas() {
            // Calcula apenas as despesas vencidas até a data atual
            if (!this.despesas || !Array.isArray(this.despesas)) {
                return '0,00';
            }
            
            const hoje = new Date();
            const diaAtual = hoje.getDate();
            const mesAtual = hoje.getMonth() + 1;
            const anoAtual = hoje.getFullYear();
            
            const total = this.despesas.reduce((soma, despesa) => {
                // Verificar se a despesa é vencida
                if (!despesa.data) return soma;
                
                const partesData = despesa.data.split('/');
                if (partesData.length !== 3) return soma;
                
                const diaDespesa = parseInt(partesData[0], 10);
                const mesDespesa = parseInt(partesData[1], 10);
                const anoDespesa = parseInt(partesData[2], 10);
                
                // Verificar se a data da despesa é anterior ou igual à data atual
                const despesaVencida = (anoDespesa < anoAtual) || 
                                     (anoDespesa === anoAtual && mesDespesa < mesAtual) ||
                                     (anoDespesa === anoAtual && mesDespesa === mesAtual && diaDespesa <= diaAtual);
                
                if (despesaVencida) {
                    let valor = despesa.valor;
                    if (typeof valor === 'string') {
                        valor = valor.replace(/\./g, '').replace(',', '.');
                    }
                    return soma + (parseFloat(valor) || 0);
                }
                return soma;
            }, 0);

            return total.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        },
        totalDespesasFuturas() {
            // Calcula apenas as despesas futuras (não vencidas)
            if (!this.despesas || !Array.isArray(this.despesas)) {
                return '0,00';
            }
            
            const hoje = new Date();
            const diaAtual = hoje.getDate();
            const mesAtual = hoje.getMonth() + 1;
            const anoAtual = hoje.getFullYear();
            
            const total = this.despesas.reduce((soma, despesa) => {
                // Verificar se a despesa é futura
                if (!despesa || !despesa.data) return soma;
                
                try {
                    const partesData = despesa.data.split('/');
                    if (partesData.length !== 3) return soma;
                    
                    const diaDespesa = parseInt(partesData[0], 10);
                    const mesDespesa = parseInt(partesData[1], 10);
                    const anoDespesa = parseInt(partesData[2], 10);
                    
                    // Verificar se a data da despesa é posterior à data atual
                    const despesaFutura = (anoDespesa > anoAtual) || 
                                        (anoDespesa === anoAtual && mesDespesa > mesAtual) ||
                                        (anoDespesa === anoAtual && mesDespesa === mesAtual && diaDespesa > diaAtual);
                    
                    if (despesaFutura) {
                        let valor = despesa.valor;
                        if (typeof valor === 'string') {
                            valor = valor.replace(/\./g, '').replace(',', '.');
                        }
                        return soma + (parseFloat(valor) || 0);
                    }
                    return soma;
                } catch (error) {
                    return soma;
                }
            }, 0);

            return total.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        },
        totalControlesDoMes() {
            return this.calcularTotal(this.controles);
        },
    },
    mounted() {
        this.carregarLocalStorage();
        this.calcularTotalDespesas();
        this.calcularTotalReceitas();
        this.calcularTotalInvestimentos();
        this.calcularTotalDividas();
        this.calcularTotalControles();
        this.calcularSaldo();
        
        // Inicializar modais apenas se os elementos existirem
        const novaDespesaModal = document.getElementById('novaDespesaModal');
        const novaReceitaModal = document.getElementById('novaReceitaModal');
        const novoInvestimentoModal = document.getElementById('novoInvestimentoModal');
        const novaDividaModal = document.getElementById('novaDividaModal');
        const novoControleModal = document.getElementById('novoControleModal');
        
        if (novaDespesaModal) {
            this.bsModal = new bootstrap.Modal(novaDespesaModal);
        }
        if (novaReceitaModal) {
            this.bsModalReceita = new bootstrap.Modal(novaReceitaModal);
        }
        if (novoInvestimentoModal) {
            this.bsModalInvestimento = new bootstrap.Modal(novoInvestimentoModal);
        }
        if (novaDividaModal) {
            this.bsModalDivida = new bootstrap.Modal(novaDividaModal);
        }
        if (novoControleModal) {
            this.bsModalControle = new bootstrap.Modal(novoControleModal);
        }
        
        const novoTipoModal = document.getElementById('novoTipoModal');
        if (novoTipoModal) {
            this.bsModalTipo = new bootstrap.Modal(novoTipoModal);
        }
    }
});

app.component('selecionar-mes-ano', {
    props: {
        mes: Number,
        ano: Number
    },
    emits: ['update:mes', 'update:ano'],
    template: `
        <div class="d-flex justify-content-between align-items-center mb-3">
        <select class="form-select bg-primary text-white" v-model.number="mesLocal">
            <option v-for="m in 12" :value="m">{{ nomeMes(m) }}</option>
        </select>
        <select class="form-select bg-primary text-white" v-model.number="anoLocal">
            <option v-for="a in anosDisponiveis" :value="a">{{ a }}</option>
        </select>
        </div>
    `,
    data() {
        return {
            mesLocal: this.mes,
            anoLocal: this.ano,
            anosDisponiveis: [2024, 2025]
        }
    },
    watch: {
        mesLocal(novo) {
            this.$emit('update:mes', novo)
        },
        anoLocal(novo) {
            this.$emit('update:ano', novo)
        },
        mes(novo) {
            this.mesLocal = novo
        },
        ano(novo) {
            this.anoLocal = novo
        }
    },
    methods: {
        nomeMes(numero) {
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
                            'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            return meses[numero - 1];
        }
    }
})

app.component('cabecalho', {
    props: {
        titulo: String,
        descricao: String
    },
    template: `
        <div>
            <h2>{{ titulo }}</h2>
            <p>{{ descricao }}</p>
        </div>
    `
})

app.component('total-card', {
    props: {
        tipo: String,
        total: [String, Function],
    },
    computed: {
        totalValue() {
            if (typeof this.total === 'function') {
                return this.total();
            }
            return this.total;
        }
    },
    template: `
        <div class="total-card mb-3">
           <span class="total-label">Total de {{ tipo }} do mês: </span>
           <span class="total-amount">R$ {{ totalValue }}</span>
        </div>
    `
})

app.mount('#app');

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch((error) => {
                console.log('Falha ao registrar Service Worker:', error);
            });
    });
} 