
procedure doc_estr
/*
 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 \ Empresa.: Presserv Informatica Ltda (19)99886.3225
 \ Programa: DOC_ESTR.PRG
 \ Data....: 09-10-07
 \ Sistema.: Entrega de documentos
 \ Funcao..: Cria estrutura dos arquivos
 \ Analista: Ademilson Pedro Bom
 \ Criacao.: GAS-Pro v4.0o
 \ Convert.: v5.0 em 2021081014:38:45 Fase_01
 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
*/

#include "docbig.ch"    // inicializa constantes manifestas

PROC DCE_estr     // estrutura do arquivo DCENTR
DBCREATE(dbf,{;
               {"seq"       ,"C",  8, 0},; // 99999999
               {"codigo"    ,"C",  6, 0},; // 999999
               {"tdoc"      ,"C", 30, 0},; // @!
               {"lin1"      ,"C", 30, 0},; // @!
               {"lin2"      ,"C", 30, 0},; // @!
               {"envio_"    ,"D",  8, 0},; // @D
               {"distrib_"  ,"D",  8, 0},; // @D
               {"entregador","C", 15, 0},; // @!
               {"nrlote"    ,"C",  6, 0},; // @!
               {"devol_"    ,"D",  8, 0},; // @D
               {"obs"       ,"C", 30, 0},; // @S20@!
               {"idxd"      ,"C", 20, 0},; // @!
               {"idxm"      ,"C", 20, 0},; // @!
               {"intlan"    ,"C",  8, 0};  // 99999999
             };
)
RETU

PROC PRZ_estr     // estrutura do arquivo PRZCOLO
DBCREATE(dbf,{;
               {"lote"      ,"C",  5, 0},; // 99999
               {"entregador","C", 15, 0},; // @!
               {"distrib_"  ,"D",  8, 0},; // @D
               {"idxd"      ,"C", 20, 0},; // @!
               {"idxm"      ,"C", 20, 0};  // @!
             };
)
RETU

PROC PR0_estr     // estrutura do arquivo PR0COLO
DBCREATE(dbf,{;
               {"lote"      ,"C",  5, 0},; // 99999
               {"seq"       ,"C",  8, 0},; // 99999999
               {"devol_"    ,"D",  8, 0},; // @D
               {"obs"       ,"C", 30, 0},; // @S20@!
               {"codigo"    ,"C",  6, 0},; // 999999
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC PRL_estr     // estrutura do arquivo PRLOTE
DBCREATE(dbf,{;
               {"nrlote"    ,"C",  6, 0},; // 999999
               {"data"      ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"obs"       ,"C", 30, 0},; // @!
               {"idxd"      ,"C", 25, 0},; // @!
               {"idxm"      ,"C", 25, 0};  // @!
             };
)
RETU

PROC PR1_estr     // estrutura do arquivo PR1COLO
DBCREATE(dbf,{;
               {"nrlote"    ,"C",  6, 0},; // 999999
               {"seq"       ,"C",  8, 0},; // 99999999
               {"devol_"    ,"D",  8, 0},; // @D
               {"obs"       ,"C", 30, 0},; // @S20@!
               {"codigo"    ,"C",  6, 0},; // 999999
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC CCA_estr     // estrutura do arquivo CCARTEIR
DBCREATE(dbf,{;
               {"seq1"      ,"C",  6, 0},; // 999999
               {"contrato"  ,"C",  6, 0},; // 999999
               {"grupo"     ,"C",  2, 0},; // !!
               {"tipcont"   ,"C",  2, 0},; // 99
               {"contrinsc" ,"C",  9, 0},; // @R 999999-9-!9
               {"codcartao" ,"C", 20, 0},; // @!
               {"nome"      ,"C", 35, 0},; // @!
               {"graup"     ,"C",  1, 0},; // 9
               {"endereco"  ,"C", 50, 0},; // @!
               {"bairro"    ,"C", 20, 0},; // @!
               {"cidade"    ,"C", 25, 0},; // @!
               {"uf"        ,"C",  2, 0},; // !!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"telefone"  ,"C", 14, 0},; // @!
               {"docto"     ,"C", 24, 0},; //
               {"nascto_"   ,"D",  8, 0},; // @D
               {"admissao"  ,"D",  8, 0},; // @D
               {"vencto"    ,"C", 25, 0},; // @!
               {"obs"       ,"C", 30, 0},; //
               {"import_"   ,"D",  8, 0},; // @D
               {"export_"   ,"D",  8, 0},; // @D
               {"retorno_"  ,"D",  8, 0},; // @D
               {"entrega_"  ,"D",  8, 0},; // @D
               {"devoluc_"  ,"D",  8, 0},; // @D
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"pgto_"     ,"D",  8, 0},; // @D
               {"numop"     ,"C",  6, 0},; // 999999
               {"lancto_"   ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"origem"    ,"C",  3, 0},; //
               {"codigo"    ,"C",  6, 0},; // 999999
               {"grau"      ,"C",  1, 0},; // 9
               {"seq"       ,"N",  2, 0};  // 99
             };
)
RETU

PROC CCR_estr     // estrutura do arquivo CCRECEB
DBCREATE(dbf,{;
               {"seq1"      ,"C",  5, 0},; // 99999
               {"codcartao" ,"C", 20, 0},; // @!
               {"idxproc"   ,"C", 20, 0},; // @!
               {"idxd"      ,"C", 20, 0},; // @!
               {"idxm"      ,"C", 20, 0};  // @!
             };
)
RETU

PROC COR_estr     // estrutura do arquivo CORRESP
DBCREATE(dbf,{;
               {"seq1"      ,"C",  4, 0},; // 9999
               {"contrato"  ,"C",  6, 0},; // 999999
               {"grupo"     ,"C",  2, 0},; // !!
               {"tipcont"   ,"C",  2, 0},; // 99
               {"nome"      ,"C", 35, 0},; // @!
               {"modelo"    ,"C", 15, 0},; // @!
               {"endereco"  ,"C", 35, 0},; // @!
               {"bairro"    ,"C", 20, 0},; // @!
               {"cidade"    ,"C", 25, 0},; // @!
               {"uf"        ,"C",  2, 0},; // !!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"telefone"  ,"C", 14, 0},; // @!
               {"docto"     ,"C", 24, 0},; //
               {"nascto_"   ,"D",  8, 0},; // @D
               {"admissao"  ,"D",  8, 0},; // @D
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"detalhe1"  ,"C", 50, 0},; // @S12
               {"detalhe2"  ,"C", 50, 0},; // @S12
               {"detalhe3"  ,"C", 50, 0},; // @S12
               {"lancto_"   ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"intlan"    ,"C",  8, 0};  // 99999999
             };
)
RETU

PROC CCO_estr     // estrutura do arquivo CCORRESP
DBCREATE(dbf,{;
               {"seq1"      ,"C",  4, 0},; // 9999
               {"contrato"  ,"C",  6, 0},; // 999999
               {"grupo"     ,"C",  2, 0},; // !!
               {"tipcont"   ,"C",  2, 0},; // 99
               {"nome"      ,"C", 35, 0},; // @!
               {"modelo"    ,"C", 15, 0},; // @!
               {"endereco"  ,"C", 35, 0},; // @!
               {"bairro"    ,"C", 20, 0},; // @!
               {"cidade"    ,"C", 25, 0},; // @!
               {"uf"        ,"C",  2, 0},; // !!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"telefone"  ,"C", 14, 0},; // @!
               {"docto"     ,"C", 24, 0},; //
               {"nascto_"   ,"D",  8, 0},; // @D
               {"admissao"  ,"D",  8, 0},; // @D
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"detalhe1"  ,"C", 50, 0},; // @S10
               {"detalhe2"  ,"C", 50, 0},; // @S10
               {"detalhe3"  ,"C", 50, 0},; // @S10
               {"lancto_"   ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0};  //
             };
)
RETU

PROC GRU_estr     // estrutura do arquivo GRUPOS
DBCREATE(dbf,{;
               {"codigo"    ,"C",  6, 0},; // 999999
               {"grupo"     ,"C",  2, 0},; // !!
               {"situacao"  ,"C",  1, 0},; // 9
               {"nome"      ,"C", 35, 0},; // @!
               {"nascto_"   ,"D",  8, 0},; // @D
               {"estcivil"  ,"C",  2, 0},; // !!
               {"cpf"       ,"C", 11, 0},; // @R 999.999.999-99
               {"rg"        ,"C", 20, 0},; // @!
               {"endereco"  ,"C", 50, 0},; // @!
               {"bairro"    ,"C", 35, 0},; // @!
               {"cidade"    ,"C", 35, 0},; // @!
               {"uf"        ,"C",  2, 0},; // !!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"natural"   ,"C", 25, 0},; // @K!   ****
               {"relig"     ,"C", 40, 0},; // @!    ****
               {"contato"   ,"C", 25, 0},; // @!
               {"telefone"  ,"C", 14, 0},; // @!
               {"tipcont"   ,"C",  2, 0},; // 99
               {"vlcarne"   ,"C",  3, 0},; //
               {"formapgto" ,"C",  2, 0},; // 99
               {"seguro"    ,"N",  2, 0},; //
               {"admissao"  ,"D",  8, 0},; // @D
               {"tcarencia" ,"D",  8, 0},; // @D
               {"saitxa"    ,"C",  4, 0},; // @R 99/99
               {"diapgto"   ,"C",  2, 0},; // 99    ****
               {"vendedor"  ,"C",  3, 0},; // !!!
               {"regiao"    ,"C",  3, 0},; // 999
               {"cobrador"  ,"C",  3, 0},; // !!!
               {"obs"       ,"M", 10, 0},; // @S35  ****
               {"renovar"   ,"D",  8, 0},; // @D
               {"funerais"  ,"N",  2, 0},; // 99
               {"circinic"  ,"C",  3, 0},; // 999
               {"ultcirc"   ,"C",  3, 0},; // 999
               {"qtcircs"   ,"N",  3, 0},; // 999
               {"qtcircpg"  ,"N",  3, 0},; // 999
               {"titular"   ,"C",  3, 0},; //
               {"particv"   ,"N",  2, 0},; // 99
               {"particf"   ,"N",  2, 0},; // 99
               {"nrdepend"  ,"N",  2, 0},; // 99
               {"ultimp_"   ,"D",  8, 0},; // @D
               {"ender_"    ,"D",  8, 0},; // @D
               {"ultend"    ,"C", 10, 0},; //
               {"em_"       ,"D",  8, 0},; // @D    ****
               {"por"       ,"C", 10, 0},; // @!    ****
               {"atend1"    ,"C", 15, 0},; // @!    ****
               {"atend2"    ,"C", 15, 0},;  //       ****
               {"ultnraux"  ,"C",  3, 0},; // @!    ****
               {"ultdtaux"  ,"D",  8, 0},; // @!    ****
               {"ultvlaux"  ,"N", 11, 2},; // @!    ****
               {"email"     ,"C", 50, 0},; //
               {"segmesref" ,"D",  8, 0},; // @!    ****
               {"segcodcob" ,"C",  3, 0},; // @!    ****
               {"segservcod","C",  3, 0},; // @!    ****
               {"nrsorteio" ,"C",  6, 0},; //       ****
               {"complem"   ,"C", 35, 0};  //
             };
)
RETU

PROC ECO_estr     // estrutura do arquivo ECOB
DBCREATE(dbf,{;
               {"codigo"    ,"C",  6, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"endereco"  ,"C", 35, 0},; // @!
               {"bairro"    ,"C", 20, 0},; // @!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"cidade"    ,"C", 25, 0},; // @!
               {"uf"        ,"C",  2, 0},; // !!
               {"telefone"  ,"C", 14, 0},; // @!
               {"obs"       ,"C", 20, 0},; //
               {"data_"     ,"D",  8, 0},; // @D
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC INS_estr     // estrutura do arquivo INSCRITS
DBCREATE(dbf,{;
               {"codigo"    ,"C",  6, 0},; // 999999
               {"grau"      ,"C",  1, 0},; // 9
               {"seq"       ,"N",  2, 0},; // 99
               {"ehtitular" ,"C",  1, 0},; // !
               {"nome"      ,"C", 35, 0},; // @!
               {"nascto_"   ,"D",  8, 0},; // @D
               {"estcivil"  ,"C",  2, 0},; //
               {"interdito" ,"C",  1, 0},; // !
               {"sexo"      ,"C",  1, 0},; // !
               {"tcarencia" ,"D",  8, 0},; // @D
               {"lancto_"   ,"D",  8, 0},; // @D
               {"vivofalec" ,"C",  1, 0},; // !
               {"falecto_"  ,"D",  8, 0},; // @D
               {"tipo"      ,"C",  3, 0},; // !!!
               {"procnr"    ,"C",  7, 0},; // @R 99999/99
               {"por"       ,"C", 10, 0},; //
               {"flag_excl" ,"C",  1, 0},; //
               {"cpf"       ,"C", 15, 0},; //
               {"segmesref" ,"D",  8, 0},; // @!    ****
               {"segpercen" ,"N",  6, 2},; // @!    ****
               {"segcodcob" ,"C",  3, 0},; // @!    ****
               {"segservcod","C",  3, 0};  // !
             };
)
RETU

PROC TAX_estr     // estrutura do arquivo TAXAS
DBCREATE(dbf,{;
               {"codigo"    ,"C",  6, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // 9
               {"circ"      ,"C",  3, 0},; // 999
               {"emissao_"  ,"D",  8, 0},; // @D
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"pgto_"     ,"D",  8, 0},; // @D
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"cobrador"  ,"C",  3, 0},; // !!!
               {"forma"     ,"C",  1, 0},; // !
               {"baixa_"    ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"stat"      ,"C",  1, 0},; // 9
               {"filial"    ,"C",  2, 0},; // @!
               {"flag_excl" ,"C",  1, 0},; // !
               {"cedente"   ,"C",  7, 0},; // !
               {"nnumero"   ,"C", 15, 0},; // !
               {"codlan"    ,"C", 20, 0};  // !!!-99999999-999-999
             };
)
RETU

PROC ADE_estr     // estrutura do arquivo ADENDOS
DBCREATE(dbf,{;
               {"codigo"    ,"C",  6, 0},; // 999999
               {"codproduto","C",  4, 0},; // 9999
               {"incluido_" ,"D",  8, 0},; // @D
               {"idxd"      ,"C", 20, 0},; // @!
               {"idxm"      ,"C", 20, 0},; // @!
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC ARQ_estr     // estrutura do arquivo ARQGRUP
DBCREATE(dbf,{;
               {"grup"      ,"C",  2, 0},; // !!
               {"classe"    ,"C",  2, 0},; // 99
               {"inicio"    ,"C",  6, 0},; // 999999
               {"final"     ,"C",  6, 0},; // 999999
               {"acumproc"  ,"N",  2, 0},; // 99
               {"maxproc"   ,"N",  2, 0},; // 99
               {"cpadmiss"  ,"C",  1, 0},; // !
               {"periodic"  ,"N",  3, 0},; // 999
               {"qtdremir"  ,"N",  3, 0},; // 999
               {"poratend"  ,"C",  1, 0},; // !
               {"ultcirc"   ,"C",  3, 0},; // 999
               {"emissao_"  ,"D",  8, 0},; // @D
               {"procpend"  ,"N",  3, 0},; // 999
               {"contrat"   ,"N",  6, 0},; // 999999
               {"partic"    ,"N",  6, 0},; // 999999
               {"proxcirc"  ,"C",  3, 0};  // 999
             };
)
RETU

PROC IMP_estr     // estrutura do arquivo IMPPAR
DBCREATE(dbf,{;
               {"idmaq"     ,"C",  4, 0},; // @!
               {"base"      ,"C",  3, 0},; // @!
               {"docto"     ,"C", 12, 0},; //
               {"codlan"    ,"C", 20, 0};  // !!!-99999999-999-999
             };
)
RETU

PROC MEN_estr     // estrutura do arquivo MENSAG
DBCREATE(dbf,{;
               {"seq"       ,"C",  6, 0},; // 999999
               {"filtro"    ,"C",210, 0},; // @S50
               {"mens1"     ,"M", 10, 0},; // @S50
               {"lancto_"   ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0};  //
             };
)
RETU

PROC TDC_estr     // estrutura do arquivo TDCENTR
DBCREATE(dbf,{;
               {"tdoc"      ,"C", 20, 0},; // @!
               {"codlan"    ,"C", 20, 0};  // !!!-99999999-999-999
             };
)
RETU

PROC CLA_estr     // estrutura do arquivo CLASSES
DBCREATE(dbf,{;
               {"classcod"  ,"C",  2, 0},; // 99
               {"descricao" ,"C", 35, 0},; // @!
               {"contrat"   ,"N",  6, 0},; // 999999
               {"prior"     ,"C",  1, 0},; // !
               {"vljoia"    ,"N", 11, 2},; // 99999999.99
               {"nrparc"    ,"N",  2, 0},; // 99
               {"parcger"   ,"N",  2, 0},; // 99
               {"vlmensal"  ,"N", 11, 2},; // 99999999.99
               {"vldepend"  ,"N", 11, 2},; // 99999999.99
               {"nrmesval"  ,"N",  2, 0},; // 99
               {"renvenc"   ,"C",  1, 0},; // !
               {"renuso"    ,"C",  1, 0},; // !
               {"vltotal"   ,"N", 11, 2};  // @E 99,999,999.99
             };
)
RETU

PROC PAR_estr     // estrutura do arquivo PAR_DOC
DBCREATE(dbf,{;
               {"setup1"    ,"C", 40, 0},; //
               {"setup2"    ,"C", 50, 0},; //
               {"setup3"    ,"C", 50, 0},; //
               {"ptdoc"     ,"C", 30, 0},; // @!
               {"pimp"      ,"C",  1, 0},; // !
               {"pmodelo"   ,"C", 15, 0},; // @!
               {"pvalor"    ,"N",  9, 2},; // @E 999,999.99
               {"pdetalh"   ,"C", 50, 0},; // @S30
               {"pdetalh2"  ,"C", 50, 0},; // @S30
               {"pdetalh3"  ,"C", 50, 0},;  // @S30
               {"editor"    ,"C", 50, 0};  // @S30
             };
)
RETU

* \\ Final de DOC_ESTR.PRG
