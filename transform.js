const Px = require('px');
const fs = require('fs');
const csvWriter = require('csv-write-stream');


function cleanUnitValue(value) {
  if(isCountryValue(value)) return value.replace("Schweiz", "Switzerland");
  if(isCantonValue(value)) return value.substring(2);
  if(isDistrictValue(value)) return value.substring(3);
  if(isCommunityValue(value)) return value.substring(6);
  return "Unkown";
}

function isCommunityVariable(varName) {
  return varName === 'Kanton (-) / Bezirk (>>) / Gemeinde (......)'
}

function isCountryValue(value) {
  return value === 'Schweiz'
}

function isCantonValue(value) {
  return value.startsWith('- ')
}

function isDistrictValue(value) {
  return value.startsWith('>> ')
}

function isCommunityValue(value) {
  return value.startsWith('......')
}

function unitFromValue(value) {
  if(isCountryValue(value)) return "Country";
  if(isCantonValue(value)) return "Canton";
  if(isDistrictValue(value)) return "District";
  if(isCommunityValue(value)) return "Community";
  return "Unkown";
}

function* datumIndizes(valCounts) {
  //NOTE: This seems crazy at first - but by unrolling we avoid the recursion and we have
  //a fixed amount of dimensions anyway
  const dimension = valCounts.length;
  const indizes = [];

  for(var i = 0; i < valCounts[0]; i++) {
    if(dimension === 1) {
      yield [i];
    }

    for(var j = 0; j < valCounts[1]; j++) {
      if(dimension === 2) {
        yield [i, j];
        continue;
      }
      for(var k = 0; k < valCounts[2]; k++) {
        if(dimension === 3) {
          yield [i, j, k];
          continue;
        }
        for(var l = 0; l < valCounts[3]; l++) {
          if(dimension === 4) {
            yield [i, j, k, l];
            continue;
          }
          for(var m = 0; m < valCounts[4]; m++) {
            if(dimension === 5) {
              yield [i, j, k, l, m];
              continue;
            }
            for(var n = 0; n < valCounts[5]; n++) {
              if(dimension === 6) {
                yield [i, j, k , l, m, n];
                continue;
              } else {
                throw "Only at max 6 dimensions supported";
              }
            }
          }
        }
      }
    }
  }

  return indizes;
}

function* allDatums(px) {
  const counts = px.valCounts()
  const indizes = datumIndizes(counts);
  for(var index of indizes) {
    yield index.map((valueIdx, variableIdx) => {
      return px.values(variableIdx)[valueIdx];
    }).concat([px.datum(index)]);
  }
}

fs.readFile('./px-x-0102020000_402.px', 'utf8', function(err, data) {
  if(err) throw err;

  px = new Px(data);
  const vars = px.variables();
  var headers = vars.concat(['Datum'])
  if(isCommunityVariable(vars[0])) {
    headers = ['Unit Type', 'Unit'].concat(headers.slice(1))
  }

  const writer = csvWriter({
    headers: headers
  })
  writer.pipe(process.stdout);


  for(datum of allDatums(px)) {
    if(isCommunityVariable(vars[0])) {
      writer.write([unitFromValue(datum[0]), cleanUnitValue(datum[0])].concat(datum.slice(1)))
    } else {
      writer.write(datum)
    }
  }
  writer.end();
});
