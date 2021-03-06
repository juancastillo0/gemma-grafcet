grammar SimpleBoolean;

parse: expression EOF;

expression:
	left = expressionAnd OR right = expression	# orExpression
	| expressionAnd									# andParentExpression;

expressionAnd:
	left = expressionSimple AND right = expressionAnd	# andExpression
	| expressionSimple									# simpleExpression;

expressionSimple:
	NOT expression									# notExpression
	| left = numExpression op = comparator right = numExpression	# comparatorExpression
	| IDENTIFIER												# identifierExpression
	| LPAREN expression RPAREN									# parenExpression;

numExpression:
	IDENTIFIER	# identifierNumExpression
	| DECIMAL	# decimalExpression;

comparator: DIF | GT | GE | LT | LE | EQ;

AND: 'AND';
OR: 'OR';
NOT: 'NOT';
TRUE: 'TRUE';
FALSE: 'FALSE';
GT: '>';
GE: '>=';
LT: '<';
DIF: '<>';
LE: '<=';
EQ: '=';
LPAREN: '(';
RPAREN: ')';
DECIMAL: '-'? [0-9]+ ( '.' [0-9]+)?;
IDENTIFIER: [a-zA-Z_] [a-zA-Z_0-9]*;
WS: [ \r\t\u000C\n]+ -> skip;