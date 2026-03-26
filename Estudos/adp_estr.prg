
procedure adp_estr
/*
 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 \ Empresa.: Presserv Informatica Ltda (19)99886.3225
 \ Programa: ADP_ESTR.PRG
 \ Data....: 24-05-98
 \ Sistema.: Administradora - PLANO
 \ Funcao..: Cria estrutura dos arquivos
 \ Analista: Ademilson Pedro Bom
 \ Criacao.: GAS-Pro v3.0
 \ Convert.: v5.0 em 2021081108:51:44 Fase_01
 \ Convert.: v5.0 em 2021081014:45:20 Fase_01
 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
*/

#include "adpbig.ch"    // inicializa constantes manifestas

PROC GRU_estr     // estrutura do arquivo GRUPOS
DBCREATE(dbf,{;
               {"codigo"    ,"C", 09, 0},; // @!
               {"grupo"     ,"C",  5, 0},; // !!
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
               {"natural"   ,"C", 25, 0},; // @K!
               {"relig"     ,"C", 20, 0},; // @!
               {"contato"   ,"C", 25, 0},; // @!
               {"telefone"  ,"C", 14, 0},; // @!
               {"tipcont"   ,"C",  5, 0},; // 99
               {"vlcarne"   ,"C",  3, 0},; //
               {"formapgto" ,"C",  2, 0},; // 99
               {"seguro"    ,"N",  3, 0},; //
               {"admissao"  ,"D",  8, 0},; // @D
               {"tcarencia" ,"D",  8, 0},; // @D
               {"saitxa"    ,"C",  4, 0},; // @R 99/99
               {"diapgto"   ,"C",  2, 0},; // 99
               {"vendedor"  ,"C",  6, 0},; // !!!
               {"regiao"    ,"C",  6, 0},; // 999
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"obs"       ,"M", 10, 0},; // @S35
               {"renovar"   ,"D",  8, 0},; // @D
               {"funerais"  ,"N",  2, 0},; // 99
               {"circinic"  ,"C",  3, 0},; // 999
               {"ultcirc"   ,"C",  3, 0},; // 999
               {"qtcircs"   ,"N",  3, 0},; // 999
               {"qtcircpg"  ,"N",  3, 0},; // 999
               {"titular"   ,"C",  3, 0},; //
               {"particv"   ,"N",  3, 0},; // 99
               {"particf"   ,"N",  3, 0},; // 99
               {"nrdepend"  ,"N",  3, 0},; // 99
               {"ultimp_"   ,"D",  8, 0},; // @D
               {"ender_"    ,"D",  8, 0},; // @D
               {"ultend"    ,"C", 10, 0},; //
               {"em_"       ,"D",  8, 0},; // @D    ****
               {"por"       ,"C", 10, 0},; // @!    ****
               {"atend1"    ,"C", 15, 0},; // @!    ****
               {"atend2"    ,"C", 15, 0},; // @!    ****
               {"ultnraux"  ,"C",  3, 0},; // @!    ****
               {"ultdtaux"  ,"D",  8, 0},; // @!    ****
               {"ultvlaux"  ,"N", 11, 2},; // @!    ****
               {"email"     ,"C", 50, 0},; // @!    ****
               {"segmesref" ,"D",  8, 0},; // @!    ****
               {"segcodcob" ,"C",  3, 0},; // @!    ****
               {"segservcod","C",  3, 0},; // @!    ****
               {"nrsorteio" ,"C",  6, 0},; //       ****
               {"complem"   ,"C", 35, 0},; // @!    ****
               {"idempresa" ,"C",  3, 0},; // @!    ****
               {"idxd"      ,"C", 25, 0},; // @!    ****
               {"idxm"      ,"C", 25, 0};  //
             };
)
RETU

PROC TAX_estr     // estrutura do arquivo TAXAS
DBCREATE(dbf,{;
	       {"codigo"    ,"C",  9, 0},; // @!
               {"cobranca"  ,"C", 18, 0},; // @!
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // 999
               {"emissao_"  ,"D",  8, 0},; // @D
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"pgto_"     ,"D",  8, 0},; // @D
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"forma"     ,"C",  1, 0},; // !
               {"baixa_"    ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"stat"      ,"C",  1, 0},; // 9
               {"filial"    ,"C",  2, 0},; // @!
               {"flag_excl" ,"C",  1, 0},; // !
               {"cedente"   ,"C",  7, 0},; // !
               {"nnumero"   ,"C", 15, 0},; // !
               {"codlan"    ,"C", 20, 0},; // @!    ****
               {"idempresa" ,"C",  3, 0},; // @!    ****
               {"idxd"      ,"C", 25, 0},; // @!    ****
               {"idxm"      ,"C", 25, 0};  // !!!-99999999-999-999
             };
)
RETU

PROC ECO_estr     // estrutura do arquivo ECOB
DBCREATE(dbf,{;
               {"codigo"    ,"C",  9, 0},; // @!
               {"tipo"      ,"C",  1, 0},; // !
               {"endereco"  ,"C", 35, 0},; // @!
               {"bairro"    ,"C", 20, 0},; // @!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"cidade"    ,"C", 25, 0},; // @!
               {"uf"        ,"C",  2, 0},; // !!
               {"telefone"  ,"C", 14, 0},; // @!
               {"obs"       ,"C", 20, 0},; //
               {"data_"     ,"D",  8, 0},; // @D
               {"flag_excl" ,"C",  1, 0},; // @!    ****
               {"idempresa" ,"C",  3, 0},; // @!    ****
               {"idxd"      ,"C", 25, 0},; // @!    ****
               {"idxm"      ,"C", 25, 0};  // !
             };
)
RETU

PROC INS_estr     // estrutura do arquivo INSCRITS
DBCREATE(dbf,{;
	       {"codigo"    ,"C",  9, 0},; // @!
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
               {"cpf"       ,"C", 15, 0},; // @!    ****
               {"segmesref" ,"D",  8, 0},; // @!    ****
               {"segpercen" ,"N",  6, 2},; // @!    ****
               {"segcodcob" ,"C",  3, 0},; // @!    ****
               {"segservcod","C",  3, 0},; // @!    ****
               {"idempresa" ,"C",  3, 0},; // @!    ****
               {"idxd"      ,"C", 25, 0},; // @!    ****
               {"idxm"      ,"C", 25, 0};  // !
             };
)
RETU

PROC ADE_estr     // estrutura do arquivo ADENDOS
DBCREATE(dbf,{;
               {"codigo"    ,"C",  9, 0},; // 999999
               {"codproduto","C",  4, 0},; // 9999
               {"incluido_" ,"D",  8, 0},; // @D
               {"idxd"      ,"C", 20, 0},; // @!
               {"idxm"      ,"C", 20, 0},; // @!
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC CAN_estr     // estrutura do arquivo CANCELS
DBCREATE(dbf,{;
               {"cnumero"   ,"C",  8, 0},; // 999999
               {"filial"    ,"C",  2, 0},; // @!
               {"ccodigo"   ,"C",  9, 0},; // 999999
               {"cgrupo"    ,"C",  5, 0},; // !!
               {"cmotivo"   ,"C", 20, 0},; //
               {"lancto_"   ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"procto_"   ,"D",  8, 0};  // @D
             };
)
RETU

PROC PRC_estr     // estrutura do arquivo PRCESSOS
DBCREATE(dbf,{;
               {"processo"  ,"C",  9, 0},; // @R 99999/99/!!
               {"categ"     ,"C",  2, 0},; // !!
               {"saiu"      ,"C",  3, 0},; //
               {"grup"      ,"C",  5, 0},; // !!
               {"num"       ,"C",  9, 0},; // 999999
               {"grau"      ,"C",  1, 0},; // 9
               {"seq"       ,"N",  2, 0},; // 99
               {"seg"       ,"C", 35, 0},; // @!
               {"ends"      ,"C", 40, 0},; // @!
               {"bais"      ,"C", 25, 0},; // @!
               {"cids"      ,"C", 25, 0},; // @!
               {"fal"       ,"C", 35, 0},; // @!
               {"sep"       ,"C", 35, 0},; // @!
               {"dfal"      ,"D",  8, 0},; // @D
               {"codlan"    ,"C", 20, 0};  // !!!-99999999-999-999
             };
)
RETU

PROC EMC_estr     // estrutura do arquivo EMCARNE
DBCREATE(dbf,{;
               {"seq"       ,"C",  6, 0},; // 999999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"vendedor"  ,"C",  6, 0},; // !!!
               {"tip"       ,"C",  2, 0},; // @!
               {"circ"      ,"C",  3, 0},; // 999
               {"vencto_"   ,"D",  8, 0},; // @D
               {"emissao_"  ,"D",  8, 0},; // @D
               {"etiqueta_" ,"D",  8, 0},; // @D
               {"filial"    ,"C",  2, 0},; // @!
               {"lancto_"   ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"parok"     ,"N",  2, 0},; // 99
               {"intlan"    ,"C",  8, 0};  // 99999999
             };
)
RETU

PROC TCA_estr     // estrutura do arquivo TCARNES
DBCREATE(dbf,{;
               {"tip"       ,"C",  2, 0},; // 99
               {"tipcob"    ,"C",  1, 0},; // !
               {"formapgto" ,"C",  2, 0},; // 99
               {"pari"      ,"N",  1, 0},; // 9
               {"vali"      ,"N",  8, 2},; // 99999.99
               {"parf"      ,"N",  2, 0},; // 99
               {"parm"      ,"N",  1, 0};  // 9
             };
)
RETU

PROC CST_estr     // estrutura do arquivo CSTSEG
DBCREATE(dbf,{;
               {"emissao_"  ,"D",  8, 0},; // @D
               {"hora"      ,"C",  5, 0},; // 99:99
               {"quem"      ,"C", 10, 0},; //
               {"historic"  ,"C",  3, 0},; // 999
               {"contrato"  ,"C",  9, 0},; // 999999
               {"complement","C", 35, 0},; // @!
               {"qtdade"    ,"N",  5, 0},; // 99999
               {"valor"     ,"N",  9, 2},; // 999999.99
               {"tipo"      ,"C",  1, 0},; // 9
               {"circ"      ,"C",  3, 0};  // 999
             };
)
RETU

PROC BOL_estr     // estrutura do arquivo BOLETOS
DBCREATE(dbf,{;
               {"seq"       ,"C",  6, 0},; // 999999
               {"nnumero"   ,"C", 10, 0},; // 9999999999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // 999
               {"por"       ,"C", 10, 0},; //
               {"em_"       ,"D",  8, 0};  // @D
             };
)
RETU

PROC LBX_estr     // estrutura do arquivo LBXBOLET
DBCREATE(dbf,{;
               {"nrlote"    ,"C",  6, 0},; // 999999
               {"emissao_"  ,"D",  8, 0},; // @D
               {"nfcc"      ,"C",  6, 0},; // 999999
               {"totdesp"   ,"N",  9, 2},; // @E 999,999.99
               {"totcred"   ,"N",  9, 2},; // @E 999,999.99
               {"totliq"    ,"N",  9, 2},; // @E 999,999.99
               {"por"       ,"C", 10, 0},; //
               {"em_"       ,"D",  8, 0},; // @D
               {"ldesp"     ,"N",  9, 2},; // @E 999,999.99
               {"lcred"     ,"N",  9, 2};  // @E 999,999.99
             };
)
RETU

PROC BXB_estr     // estrutura do arquivo BXBOLET
DBCREATE(dbf,{;
               {"nrlote"    ,"C",  6, 0},; // 999999
               {"seq"       ,"C",  5, 0},; // 99999
               {"nnumero"   ,"C", 10, 0},; // 9999999999
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"vldesp"    ,"N",  9, 2},; // @E 999,999.99
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC TXP_estr     // estrutura do arquivo TXPROC
DBCREATE(dbf,{;
               {"codigo"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // 999
               {"emissao_"  ,"D",  8, 0},; // @D
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"pgto_"     ,"D",  8, 0},; // @D
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"forma"     ,"C",  1, 0},; // !
               {"baixa_"    ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"stat"      ,"C",  1, 0},; // 9
               {"filial"    ,"C",  2, 0},; // @!
               {"atp"       ,"C",  1, 0},; // !
               {"atc"       ,"C",  1, 0},; // !
               {"atr"       ,"C",  1, 0};  // !
             };
)
RETU

PROC TX2_estr     // estrutura do arquivo TX2VIA
DBCREATE(dbf,{;
               {"codigo"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // !!!
               {"cobrador"  ,"C",  6, 0};  // 999
             };
)
RETU

PROC CLA_estr     // estrutura do arquivo CLASSES
DBCREATE(dbf,{;
               {"classcod"  ,"C",  5, 0},; // 99
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
               {"vltotal"   ,"N", 11, 2},; // @E 99,999,999.99
               {"mensag1"   ,"C", 30, 0},; // !
               {"mensag2"   ,"C", 30, 0};  // !
             };
)
RETU

PROC CLP_estr     // estrutura do arquivo CLPRODS
DBCREATE(dbf,{;
               {"classcod"  ,"C",  5, 0},; // 99
               {"codigo"    ,"C",  4, 0},; // 9999
               {"qtdade"    ,"N",  4, 0},; // 9999
               {"data"      ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC ARQ_estr     // estrutura do arquivo ARQGRUP
DBCREATE(dbf,{;
               {"grup"      ,"C",  5, 0},; // !!
               {"classe"    ,"C",  5, 0},; // 99
               {"inicio"    ,"C",  9, 0},; // 999999
               {"final"     ,"C",  9, 0},; // 999999
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

PROC FCG_estr     // estrutura do arquivo FCGRUPO
DBCREATE(dbf,{;
               {"grup"      ,"C",  5, 0},; // !!
               {"mesref"    ,"C",  4, 0},; // @R 99/99
               {"qtdemit"   ,"N",  6, 0},; // 999999
               {"qtdpaga"   ,"N",  6, 0},; // 999999
               {"qtdret"    ,"N",  6, 0},; // 999999
               {"vlentr"    ,"N",  9, 2},; // @E 999,999.99
               {"vlreceb"   ,"N",  9, 2},; // @E 999,999.99
               {"vlretorn"  ,"N",  9, 2},; // @E 999,999.99
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC REG_estr     // estrutura do arquivo REGIAO
DBCREATE(dbf,{;
               {"codigo"    ,"C",  6, 0},; // 999
               {"regiao"    ,"C", 30, 0},; //
               {"cobrador"  ,"C",  6, 0};  // !!!
             };
)
RETU

PROC COB_estr     // estrutura do arquivo COBRADOR
DBCREATE(dbf,{;
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"funcao"    ,"C",  1, 0},; // !
               {"nome"      ,"C", 30, 0},; //
               {"endereco"  ,"C", 30, 0},; //
               {"bairro"    ,"C", 20, 0},; //
               {"cidade"    ,"C", 25, 0},; //
               {"telefone"  ,"C", 14, 0},; //
               {"cpf"       ,"C", 11, 0},; // @R 999.999.999-99
               {"obs"       ,"M", 10, 0},; // @S35
               {"percent"   ,"N",  5, 1},; // 999.9
               {"superv"    ,"C",  6, 0};  // !!!
             };
)
RETU

PROC PCB_estr     // estrutura do arquivo PCBRAD
DBCREATE(dbf,{;
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"tipo"      ,"C",  1, 0},; // 9
               {"circ"      ,"C",  3, 0},; // 999
               {"seg"       ,"C",  1, 0},; // !
               {"pcomiss"   ,"N",  6, 2},; // 999.99
               {"vlcomiss"  ,"N",  9, 2},; // @E 999,999.99
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC FCC_estr     // estrutura do arquivo FCCOB
DBCREATE(dbf,{;
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"mesref"    ,"C",  4, 0},; // @R 99/99
               {"qtdemit"   ,"N",  6, 0},; // 999999
               {"qtdpaga"   ,"N",  6, 0},; // 999999
               {"qtdret"    ,"N",  6, 0},; // 999999
               {"vlentr"    ,"N",  9, 2},; // @E 999,999.99
               {"vlreceb"   ,"N",  9, 2},; // @E 999,999.99
               {"vlretorn"  ,"N",  9, 2},; // @E 999,999.99
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC CIR_estr     // estrutura do arquivo CIRCULAR
DBCREATE(dbf,{;
               {"grupo"     ,"C",  5, 0},; // !!
               {"circ"      ,"C",  3, 0},; // 999
               {"procpend"  ,"N",  2, 0},; // 99
               {"emissao_"  ,"D",  8, 0},; // @D
               {"mesref"    ,"C",  4, 0},; // @R 99/99
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"menscirc"  ,"C", 60, 0},; // @S35
               {"menscirc1" ,"C", 35, 0},; //
               {"menscirc2" ,"C", 35, 0},; //
               {"emitidos"  ,"N",  6, 0},; // 999999
               {"pagos"     ,"N",  6, 0},; // 999999
               {"cancelados","N",  6, 0},; // 999999
               {"lancto_"   ,"D",  8, 0},; // @D
               {"funcionar" ,"C", 10, 0},; //
               {"impress_"  ,"D",  8, 0};  // @D
             };
)
RETU

PROC CPR_estr     // estrutura do arquivo CPRCIRC
DBCREATE(dbf,{;
               {"grupo"     ,"C",  5, 0},; // !!
               {"circ"      ,"C",  3, 0},; // 999
               {"processo"  ,"C",  9, 0},; // @R 99999/99/!!
               {"categ"     ,"C",  2, 0},; // !!
               {"num"       ,"C",  6, 0},; // 999999
               {"fal"       ,"C", 35, 0},; // @!
               {"ends"      ,"C", 40, 0},; // @!
               {"bais"      ,"C", 25, 0},; // @!
               {"cids"      ,"C", 15, 0},; // @!
               {"dfal"      ,"D",  8, 0},; // @D
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC FNC_estr     // estrutura do arquivo FNCS
DBCREATE(dbf,{;
               {"codigo"    ,"C",  3, 0},; //
               {"nome"      ,"C", 35, 0},; // @!
               {"profiss"   ,"C", 15, 0},; // @!
               {"nacional"  ,"C", 15, 0},; // @!
               {"estciv"    ,"C",  2, 0},; // !!
               {"nascto_"   ,"D",  8, 0},; // @D
               {"endereco"  ,"C", 30, 0},; // @!
               {"bairro"    ,"C", 25, 0},; // @!
               {"cidade"    ,"C", 25, 0},; // @!
               {"cpf"       ,"C", 11, 0},; // @R 999.999.999-99
               {"telefone"  ,"C", 14, 0},; //
               {"percent"   ,"N",  5, 1},; // 999.9
               {"obs"       ,"M", 10, 0};  // @S35
             };
)
RETU

PROC JUR_estr     // estrutura do arquivo JUROS
DBCREATE(dbf,{;
               {"tipo"      ,"C",  1, 0},; // 9
               {"multa"     ,"N",  5, 2},; // 99.99
               {"mltcaren"  ,"N",  3, 0},; // 999
               {"juros"     ,"N",  5, 3},; // 9.999
               {"jrscaren"  ,"N",  3, 0};  // 999
             };
)
RETU

PROC HIS_estr     // estrutura do arquivo HISTORIC
DBCREATE(dbf,{;
               {"historico" ,"C",  3, 0},; // 999
               {"descricao" ,"C", 40, 0},; //
               {"tipo"      ,"C",  1, 0},; // !
               {"origem"    ,"C",  3, 0},; // !!!
               {"recdesp"   ,"C",  1, 0},; // !
               {"codigo"    ,"C",  6, 0},; // @!
               {"intlan"    ,"C",  8, 0},; // 99999999
               {"codlan"    ,"C", 20, 0};  // !!!-99999999-999-999
             };
)
RETU

PROC CGR_estr     // estrutura do arquivo CGRUPOS
DBCREATE(dbf,{;
               {"numero"    ,"C",  9, 0},; // 999999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"grupo"     ,"C",  5, 0},; // !!
               {"motivo"    ,"C", 25, 0},; //
               {"canclto_"  ,"D",  8, 0},; // @D
               {"cancpor"   ,"C", 10, 0},; //
               {"reintnum"  ,"C",  9, 0},; // 999999
               {"motreint"  ,"C", 30, 0},; // @!
               {"reintem_"  ,"D",  8, 0},; // @D
               {"reintpor"  ,"C", 10, 0},; //
               {"codreint"  ,"C", 14, 0},; // @R !!/999999
               {"situacao"  ,"C",  1, 0},; // 9
               {"nome"      ,"C", 35, 0},; //
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
               {"relig"     ,"C", 20, 0},; // @!    ****
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
               {"vendedor"  ,"C",  6, 0},; // !!!
               {"regiao"    ,"C",  6, 0},; // 999
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"obs"       ,"M", 10, 0},; // @S35
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
               {"ultend"    ,"C", 10, 0},;  //
               {"em_"       ,"D",  8, 0},; // @D    ****
               {"por"       ,"C", 10, 0},; // @!    ****
               {"atend1"    ,"C", 15, 0},; // @!    ****
               {"atend2"    ,"C", 15, 0},; // @!    ****
               {"ultnraux"  ,"C",  3, 0},; // @!    ****
               {"ultdtaux"  ,"D",  8, 0},; // @!    ****
               {"ultvlaux"  ,"N", 11, 2},; // @!    ****
               {"email"     ,"C", 50, 0},; //
               {"segmesref" ,"D",  8, 0},; // @!    ****
               {"segcodcob" ,"C",  3, 0},; // @!    ****
               {"segservcod","C",  3, 0},; // @!    ****
               {"nrsorteio" ,"C",  6, 0},; //       ****
               {"complem"   ,"C", 35, 0},; //       ****
               {"idempresa" ,"C",  3, 0},; //       ****
               {"idxd"      ,"C", 25, 0},; //       ****
               {"idxm"      ,"C", 25, 0};  //
             };
)
RETU

PROC COE_estr     // estrutura do arquivo COECOB
DBCREATE(dbf,{;
               {"numero"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"endereco"  ,"C", 35, 0},; // @!
               {"bairro"    ,"C", 20, 0},; // @!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"cidade"    ,"C", 25, 0},; // @!
               {"uf"        ,"C",  2, 0},; // !!
               {"telefone"  ,"C", 14, 0},; // @!
               {"obs"       ,"C", 20, 0},; //
               {"flag_excl" ,"C",  1, 0},; //       ****
               {"idempresa" ,"C",  3, 0},; //       ****
               {"idxd"      ,"C", 25, 0},; //       ****
               {"idxm"      ,"C", 25, 0};  // !
             };
)
RETU

PROC CIN_estr     // estrutura do arquivo CINSCRIT
DBCREATE(dbf,{;
               {"numero"    ,"C",  9, 0},; // 999999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"grau"      ,"C",  1, 0},; // 9
               {"seq"       ,"N",  2, 0},; // 99
               {"ehtitular" ,"C",  1, 0},; // !
               {"nome"      ,"C", 35, 0},; //
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
               {"segservcod","C",  3, 0},; //       ****
               {"idempresa" ,"C",  3, 0},; //       ****
               {"idxd"      ,"C", 25, 0},; //       ****
               {"idxm"      ,"C", 25, 0};  // !
             };
)
RETU

PROC CTA_estr     // estrutura do arquivo CTAXAS
DBCREATE(dbf,{;
               {"numero"    ,"C",  9, 0},; // 999999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // 999
               {"emissao_"  ,"D",  8, 0},; // @D
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"pgto_"     ,"D",  8, 0},; // @D
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"forma"     ,"C",  1, 0},; // !
               {"baixa_"    ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"stat"      ,"C",  1, 0},; // 9
               {"filial"    ,"C",  2, 0},; // @!
               {"flag_excl" ,"C",  1, 0},; // !
               {"banco"     ,"C",  3, 0},; // !
               {"agencia"   ,"C", 10, 0},; // !
               {"conta"     ,"C", 10, 0},; // !
               {"cedente"   ,"C",  7, 0},; // !
               {"nnumero"   ,"C", 15, 0},; // !
               {"codlan"    ,"C", 20, 0},; //       ****
               {"idempresa" ,"C",  3, 0},; //       ****
               {"idxd"      ,"C", 25, 0},; //       ****
               {"idxm"      ,"C", 25, 0};  // !!!-99999999-999-999
             };
)
RETU

PROC PRA_estr     // estrutura do arquivo PRODUTOS DO ADENDO
DBCREATE(dbf,{;
               {"codigo"    ,"C",  4, 0},; // 9999
               {"produto"   ,"C", 30, 0},; // @!
               {"unid"      ,"C",  2, 0},; // @!
               {"reftec"    ,"M", 10, 0},; // @S35
               {"grupo"     ,"C", 10, 0},; // @!
               {"depto"     ,"C", 10, 0},; // @!
               {"qd_min"    ,"N",  4, 0},; // 9999
               {"qd_ped"    ,"N",  5, 0},; // 99999
               {"qd_rec"    ,"N",  5, 0},; // 99999
               {"qd_ven"    ,"N",  5, 0},; // 99999
               {"qd_loc"    ,"N",  5, 0},; // 99999
               {"qd_est"    ,"N",  6, 0},; // 999999
               {"preco_cus" ,"N", 12, 2},; // 999999999.99
               {"custo_"    ,"D",  8, 0},; // @D
               {"preco_ven" ,"N", 12, 2},; // 999999999.99
               {"venda_"    ,"D",  8, 0},; // @D
               {"dt_ult_atu","D",  8, 0};  // @D
             };
)
RETU

PROC TFI_estr     // estrutura do arquivo TFILIAIS
DBCREATE(dbf,{;
               {"codigo"    ,"C",  2, 0},; // @!
               {"abrev"     ,"C", 25, 0},; //
               {"nome"      ,"C", 50, 0},; // @!
               {"endereco"  ,"C", 50, 0},; // @!
               {"cidade"    ,"C", 50, 0},; // @!
               {"ref"       ,"M", 10, 0},; // @S35
               {"contato"   ,"C", 20, 0};  // @!
             };
)
RETU

PROC TXE_estr     // estrutura do arquivo TXENTR
DBCREATE(dbf,{;
               {"seq"       ,"N",  6, 0},; // 999999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // 999
               {"valor"     ,"N",  9, 2},; // @E 999,999.99
               {"cob"       ,"C",  3, 0},; // !!!
               {"mesref"    ,"C",  4, 0},; // @R 99/99
               {"pgto_"     ,"D",  8, 0},; // @D
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"forma"     ,"C",  1, 0},; //
               {"baixa_"    ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0};  //
             };
)
RETU

PROC BXR_estr     // estrutura do arquivo BXREC
DBCREATE(dbf,{;
               {"numero"    ,"C",  8, 0},; // 999999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"cobranca"  ,"C", 18, 0},; // @!
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"valoraux"  ,"N",  9, 2},; // @E 999,999.99
               {"emitido_"  ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"numop"     ,"C",  6, 0},; // 999999
               {"grupo"     ,"C",  5, 0},; // !9
               {"filial"    ,"C",  2, 0},; // @!
               {"intlan"    ,"C",  8, 0},;  // 99999999
               {"forma_pg"  ,"C", 15, 0},; // @!
               {"obs_pg"    ,"C", 35, 0},;  // @!
               {"idxd"      ,"C", 30, 0},; // @!
               {"idxm"      ,"C", 30, 0};  // @!
             };
)
RETU

PROC ALE_estr     // estrutura do arquivo ALENDER
DBCREATE(dbf,{;
               {"codigo"    ,"C",  9, 0},; // 999999
               {"endereco"  ,"C", 35, 0},; // @!
               {"bairro"    ,"C", 25, 0},; // @!
               {"cidade"    ,"C", 25, 0},; // @!
               {"cep"       ,"C",  8, 0},; // @R 99999-999
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"data_"     ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"dendereco" ,"C", 35, 0},; // @!
               {"dbairro"   ,"C", 25, 0},; // @!
               {"dcidade"   ,"C", 25, 0},; // @!
               {"dcep"      ,"C",  8, 0},; // @R 99999-999
               {"dcobrador" ,"C",  6, 0},; // !!!
               {"dgrupo"    ,"C",  5, 0},; //
               {"emitido_"  ,"D",  8, 0},; // @D
               {"filial"    ,"C",  2, 0};  // @!
             };
)
RETU

PROC BXF_estr     // estrutura do arquivo BXFCC
DBCREATE(dbf,{;
               {"idfilial"  ,"C",  2, 0},; // !!
               {"numero"    ,"C",  6, 0},; // 999999
               {"lancto_"   ,"D",  8, 0},; // @D
               {"por"       ,"C", 10, 0},; //
               {"cobrador"  ,"C",  6, 0},; // !!!
               {"nomecobr"  ,"C", 30, 0},; // @!
               {"despesas"  ,"N", 11, 2},; // 99999999.99
               {"baixa_"    ,"D",  8, 0},; // @D
               {"comtxa"    ,"N",  5, 1},; // 999.9
               {"comtroc"   ,"N",  5, 1},; // 999.9
               {"comcarn"   ,"N",  5, 1},; // 999.9
               {"comoutr"   ,"N",  5, 1},; // 999.9
               {"qtdoutr"   ,"N",  5, 0},; // 99999
               {"vloutr"    ,"N",  9, 2},; // @E 999,999.99
               {"parcpag"   ,"N",  5, 0},; // 99999
               {"vltaxas"   ,"N",  9, 2},; // @E 999,999.99
               {"parctroc"  ,"N",  5, 0},; // 99999
               {"vltrocas"  ,"N",  9, 2},; // @E 999,999.99
               {"parccarn"  ,"N",  5, 0},; // 99999
               {"vlcarnes"  ,"N",  9, 2},; // @E 999,999.99
               {"vlrbaix"   ,"N", 11, 2},; // 99999999.99
               {"nrccpagar" ,"C",  6, 0},; //
               {"numop"     ,"C",  6, 0},; // 999999
               {"intlan"    ,"C",  8, 0};  // 99999999
             };
)
RETU

PROC BXT_estr     // estrutura do arquivo BXTXAS
DBCREATE(dbf,{;
               {"idfilial"  ,"C",  2, 0},; // !!
               {"numero"    ,"C",  6, 0},; // 999999
               {"seq"       ,"C",  5, 0},; // 99999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // 999
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"procok"    ,"C",  1, 0},; //
               {"flag_excl" ,"C",  1, 0};  // !
             };
)
RETU

PROC TRO_estr     // estrutura do arquivo TROTXAS
DBCREATE(dbf,{;
               {"idfilial"  ,"C",  2, 0},; // !!
               {"numero"    ,"C",  6, 0},; // 999999
               {"seq"       ,"C",  5, 0},; // 99999
               {"codigo"    ,"C",  9, 0},; // 999999
               {"tipo"      ,"C",  1, 0},; // !
               {"circ"      ,"C",  3, 0},; // 999
               {"valorpg"   ,"N",  9, 2},; // @E 999,999.99
               {"procok"    ,"C",  1, 0},; //
               {"flag_excl" ,"C",  1, 0};  // !
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

PROC CEP_estr     // estrutura do arquivo CEP
DBCREATE(dbf,{;
               {"nome_log"  ,"C", 60, 0},; // @!
               {"local_log" ,"C", 60, 0},; // @!
               {"bairro_1"  ,"C", 30, 0},; // @!
               {"bairro_2"  ,"C", 30, 0},; // @!
               {"cep5_log"  ,"C",  5, 0},; //
               {"cep8_log"  ,"C",  8, 0},; // @R 99999-999
               {"uf_log"    ,"C",  2, 0},; // !!
               {"tipo_log"  ,"C", 10, 0};  //
             };
)
RETU

PROC AFU_estr     // estrutura do arquivo AFUNER
DBCREATE(dbf,{;
               {"processo"  ,"C",  5, 0},; // 99999
               {"proc2"     ,"C",  2, 0},; // 99
               {"filial"    ,"C",  2, 0},; // @!
               {"ocorr_"    ,"D",  8, 0},; // @D
               {"categ"     ,"C",  2, 0},; // !!
               {"contrato"  ,"C",  9, 0},; // 999999
               {"grauparcon","C", 10, 0},; //
               {"nomedec"   ,"C", 35, 0},; // @!
               {"ruadec"    ,"C", 35, 0},; // @!
               {"fonedec"   ,"C", 14, 0},; // @!
               {"codigofal" ,"C", 11, 0},; //
               {"falecido"  ,"C", 35, 0},; //
               {"ruares"    ,"C", 30, 0},; //
               {"baires"    ,"C", 25, 0},; //
               {"munres"    ,"C", 25, 0},; //
               {"estres"    ,"C",  2, 0},; // !!
               {"nascto_"   ,"D",  8, 0},; // @D
               {"falecto_"  ,"D",  8, 0},; // @D
               {"horafal"   ,"C",  5, 0},; // 99:99
               {"ruafal"    ,"C", 30, 0},; //
               {"municfal"  ,"C", 25, 0},; //
               {"estfal"    ,"C",  2, 0},; // !!
               {"sepult_"   ,"D",  8, 0},; // @D
               {"horasepult","C",  5, 0},; // 99:99
               {"cemitsep"  ,"C", 30, 0},; //
               {"funcresp"  ,"C",  6, 0},; // 999
               {"procpagto_","D",  8, 0},; // @D
               {"vlauxilio" ,"N", 14, 2},; // 99999999999.99
               {"pagtoem_"  ,"D",  8, 0},; // @D
               {"intlan"    ,"C",  8, 0};  // 99999999
             };
)
RETU

PROC PAR_estr     // estrutura do arquivo PAR_ADM
DBCREATE(dbf,{;
               {"pgrupo"    ,"C",  5, 0},; // !!
               {"p_filial"  ,"C",  2, 0},; // @!
               {"pcontrato" ,"C",  9, 0},; // 999999
               {"pgrau"     ,"C",  1, 0},; // 9
               {"pseq"      ,"N",  2, 0},; // 99
               {"pverpag"   ,"C",  1, 0},; // !
               {"preplanc"  ,"C",  1, 0},; // !
               {"lastcodigo","C",  9, 0},; // 999999
               {"nrcanc"    ,"N",  9, 0},; // 999999
               {"nrreint"   ,"N",  9, 0},; // 999999
               {"contarec"  ,"C",  5, 0},; // @!
               {"contapag"  ,"C",  5, 0},; // @!
               {"histrcfcc" ,"C",  3, 0},; // 999
               {"histrcrec" ,"C",  3, 0},; // 999
               {"histrccar" ,"C",  3, 0},; // 999
               {"histpg"    ,"C",  3, 0},; // 999
               {"nrauxrec"  ,"C",  8, 0},; // @R 99-999999
               {"mcodigo"   ,"C",  9, 0},; // 999999
               {"mtipo"     ,"C",  1, 0},; // !
               {"mcirc"     ,"C",  3, 0},; // 999
               {"mgrupvip"  ,"C",  2, 0},; // !!
               {"combarra"  ,"C",  1, 0},; // !
               {"cinscr"    ,"C",  1, 0},; // !
               {"comfalec"  ,"C",  1, 0},; // !
               {"mproc1"    ,"C",  5, 0},; // 99999
               {"mproc2"    ,"C",  2, 0},; // 99
               {"mproc3"    ,"C",  2, 0},; // 99
               {"impnrrec"  ,"C",  5, 0},; // 99999
               {"procimp"   ,"C",  9, 0},; // @R 99999/99/!!
               {"pvalor"    ,"N",  9, 2},; // @E 999,999.99
               {"pcob"      ,"C",  3, 0},; // !!!
               {"mmesref"   ,"C",  4, 0},; // @R 99/99
               {"pnumfcc"   ,"C",  8, 0},; //
               {"p_cidade"  ,"C", 25, 0},; // @!
               {"p_recp"    ,"C",  1, 0},; // !
               {"setup1"    ,"C", 40, 0},; //
               {"cgcsetup"  ,"C", 14, 0},; // @R 99.999.999/9999-99
               {"setup2"    ,"C", 50, 0},; //
               {"setup3"    ,"C", 50, 0},; //
               {"pcedente"  ,"C",  7, 0};  //
             };
)
RETU

* \\ Final de ADP_ESTR.PRG
